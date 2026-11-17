-- 01_esquema.sql
-- Esquema base relacional de la ferretería (tablas núcleo, llaves y restricciones).
-- Se ejecuta dentro de la base indicada por POSTGRES_DB al inicializar el contenedor.

-- Extensión para generar UUID si se requiere (opcional, aquí usamos serial/identidad simple).
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- Tabla de sucursales: catálogo fijo de las tres sucursales
-- =========================================================
CREATE TABLE sucursal ( -- crea la tabla de sucursales
    id_sucursal      SERIAL PRIMARY KEY, -- identificador único autoincremental de la sucursal
    nombre           VARCHAR(100) NOT NULL, -- nombre de la sucursal
    ciudad           VARCHAR(100) NOT NULL, -- ciudad donde se ubica la sucursal
    direccion        TEXT NOT NULL, -- dirección física de la sucursal
    telefono         VARCHAR(30), -- teléfono de contacto (opcional)
    activo           BOOLEAN NOT NULL DEFAULT TRUE, -- indica si la sucursal está operando
    fecha_registro   TIMESTAMP NOT NULL DEFAULT NOW() -- fecha/hora de registro
); -- fin de la tabla sucursal

-- =========================================================
-- Tabla de usuarios del sistema con rol para control de acceso
-- =========================================================
CREATE TABLE usuario ( -- crea la tabla de usuarios
    id_usuario       SERIAL PRIMARY KEY, -- identificador único del usuario
    nombre           VARCHAR(120) NOT NULL, -- nombre completo del usuario
    correo           VARCHAR(120) NOT NULL UNIQUE, -- correo único usado para iniciar sesión
    clave_hash       VARCHAR(255) NOT NULL, -- contraseña almacenada como hash (nunca en texto plano)
    rol              VARCHAR(20) NOT NULL CHECK (rol IN ('administrador','gerente','cajero')), -- rol permitido
    id_sucursal      INT REFERENCES sucursal(id_sucursal), -- sucursal a la que pertenece (puede ser nula para admin global)
    activo           BOOLEAN NOT NULL DEFAULT TRUE, -- indica si la cuenta está activa
    creado_en        TIMESTAMP NOT NULL DEFAULT NOW() -- fecha/hora de creación del usuario
); -- fin de la tabla usuario

-- =========================================================
-- Tipo compuesto para dimensiones físicas del producto
-- (BD orientada a objetos: tipos compuestos)
-- =========================================================
CREATE TYPE dimensiones_t AS ( -- define un tipo compuesto llamado dimensiones_t
    largo_cm NUMERIC(10,2), -- largo del producto en centímetros
    ancho_cm NUMERIC(10,2), -- ancho del producto en centímetros
    alto_cm  NUMERIC(10,2), -- alto del producto en centímetros
    peso_kg  NUMERIC(10,3)  -- peso del producto en kilogramos
); -- fin del tipo compuesto

-- =========================================================
-- Tabla base de productos (superclase para herencia)
-- Incluye arreglo (etiquetas/códigos alternos) y JSONB (especificaciones)
-- =========================================================
CREATE TABLE producto ( -- crea la tabla base de productos
    id_producto      SERIAL PRIMARY KEY, -- identificador único del producto
    sku              VARCHAR(40) NOT NULL UNIQUE, -- código SKU único del producto
    nombre           VARCHAR(150) NOT NULL, -- nombre del producto
    descripcion      TEXT, -- descripción general del producto
    precio_mxn       NUMERIC(12,2) NOT NULL CHECK (precio_mxn >= 0), -- precio en pesos, no negativo
    unidad_medida    VARCHAR(30) NOT NULL DEFAULT 'pieza', -- unidad de medida (pieza, metro, caja, etc.)
    dimensiones      dimensiones_t, -- dimensiones físicas usando el tipo compuesto
    etiquetas        TEXT[] NOT NULL DEFAULT '{}', -- arreglo de etiquetas para búsqueda
    codigos_alternos TEXT[] NOT NULL DEFAULT '{}', -- arreglo de códigos de barras/códigos alternos
    especificaciones JSONB NOT NULL DEFAULT '{}'::jsonb, -- atributos flexibles en formato JSONB
    activo           BOOLEAN NOT NULL DEFAULT TRUE, -- indica si el producto está activo en catálogo
    creado_en        TIMESTAMP NOT NULL DEFAULT NOW() -- fecha/hora de creación del registro
); -- fin de la tabla producto

-- Índice GIN para búsquedas eficientes dentro del JSONB de especificaciones
CREATE INDEX idx_producto_especificaciones_gin ON producto USING GIN (especificaciones); -- acelera consultas sobre claves/valores JSONB
-- Índice GIN para búsquedas eficientes dentro del arreglo de etiquetas
CREATE INDEX idx_producto_etiquetas_gin ON producto USING GIN (etiquetas); -- acelera búsquedas por etiquetas

-- =========================================================
-- Inventario: existencias de cada producto por sucursal
-- Nota: no se usa FK a producto(id_producto) porque con herencia (INHERITS)
-- las filas viven en tablas hijas y la FK a la tabla padre no las reconoce.
-- La integridad se asegura desde la lógica/funciones de la aplicación.
-- =========================================================
CREATE TABLE inventario ( -- crea la tabla de inventario por sucursal
    id_inventario    SERIAL PRIMARY KEY, -- identificador único del registro de inventario
    id_sucursal      INT NOT NULL REFERENCES sucursal(id_sucursal), -- sucursal dueña de la existencia
    id_producto      INT NOT NULL, -- identificador del producto (sin FK directa por uso de herencia)
    stock            INT NOT NULL DEFAULT 0 CHECK (stock >= 0), -- cantidad disponible, nunca negativa
    stock_minimo     INT NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0), -- umbral mínimo para reabastecer
    actualizado_en   TIMESTAMP NOT NULL DEFAULT NOW(), -- última actualización de existencia
    UNIQUE (id_sucursal, id_producto) -- una sola fila de inventario por combinación sucursal-producto
); -- fin de la tabla inventario

-- =========================================================
-- Venta: encabezado de cada venta realizada en una sucursal
-- =========================================================
CREATE TABLE venta ( -- crea la tabla encabezado de ventas
    id_venta         SERIAL PRIMARY KEY, -- identificador único de la venta
    folio            VARCHAR(30) NOT NULL UNIQUE, -- folio legible único de la venta
    id_sucursal      INT NOT NULL REFERENCES sucursal(id_sucursal), -- sucursal donde se realiza la venta
    id_usuario       INT NOT NULL REFERENCES usuario(id_usuario), -- cajero/usuario que registra la venta
    fecha_venta      TIMESTAMP NOT NULL DEFAULT NOW(), -- fecha/hora de la venta
    subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0), -- suma de importes antes de impuestos
    total            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0), -- total final de la venta
    estado           VARCHAR(20) NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada','cancelada')) -- estado de la venta
); -- fin de la tabla venta

-- =========================================================
-- Detalle de venta: renglones/productos de cada venta
-- Nota: id_producto sin FK directa por uso de herencia en producto.
-- =========================================================
CREATE TABLE venta_detalle ( -- crea la tabla de detalle de ventas
    id_detalle       SERIAL PRIMARY KEY, -- identificador único del renglón
    id_venta         INT NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE, -- venta a la que pertenece el renglón
    id_producto      INT NOT NULL, -- producto vendido (sin FK directa por uso de herencia)
    cantidad         INT NOT NULL CHECK (cantidad > 0), -- cantidad vendida, mayor a cero
    precio_unitario  NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0), -- precio unitario al momento de la venta
    importe          NUMERIC(12,2) NOT NULL CHECK (importe >= 0) -- importe del renglón (cantidad * precio)
); -- fin de la tabla venta_detalle

-- =========================================================
-- Traspaso: movimiento de mercancía entre sucursales
-- =========================================================
CREATE TABLE traspaso ( -- crea la tabla de traspasos entre sucursales
    id_traspaso      SERIAL PRIMARY KEY, -- identificador único del traspaso
    folio            VARCHAR(30) NOT NULL UNIQUE, -- folio legible único del traspaso
    sucursal_origen  INT NOT NULL REFERENCES sucursal(id_sucursal), -- sucursal que envía la mercancía
    sucursal_destino INT NOT NULL REFERENCES sucursal(id_sucursal), -- sucursal que recibe la mercancía
    id_usuario       INT NOT NULL REFERENCES usuario(id_usuario), -- usuario que registra el traspaso
    fecha_traspaso   TIMESTAMP NOT NULL DEFAULT NOW(), -- fecha/hora del traspaso
    estado           VARCHAR(20) NOT NULL DEFAULT 'completado' CHECK (estado IN ('pendiente','completado','cancelado')), -- estado del traspaso
    CHECK (sucursal_origen <> sucursal_destino) -- impide traspasos a la misma sucursal
); -- fin de la tabla traspaso

-- =========================================================
-- Detalle de traspaso: productos incluidos en el traspaso
-- Nota: id_producto sin FK directa por uso de herencia en producto.
-- =========================================================
CREATE TABLE traspaso_detalle ( -- crea la tabla de detalle de traspasos
    id_detalle       SERIAL PRIMARY KEY, -- identificador único del renglón de traspaso
    id_traspaso      INT NOT NULL REFERENCES traspaso(id_traspaso) ON DELETE CASCADE, -- traspaso al que pertenece
    id_producto      INT NOT NULL, -- producto traspasado (sin FK directa por uso de herencia)
    cantidad         INT NOT NULL CHECK (cantidad > 0) -- cantidad traspasada, mayor a cero
); -- fin de la tabla traspaso_detalle

-- =========================================================
-- Bitácora: registro de operaciones relevantes (ventas, traspasos, etc.)
-- =========================================================
CREATE TABLE bitacora ( -- crea la tabla de bitácora de operaciones
    id_bitacora      SERIAL PRIMARY KEY, -- identificador único del evento
    tabla_afectada   VARCHAR(60) NOT NULL, -- nombre de la tabla donde ocurrió la operación
    operacion        VARCHAR(20) NOT NULL, -- tipo de operación (INSERT, UPDATE, DELETE, VENTA, TRASPASO)
    id_registro      INT, -- identificador del registro afectado (si aplica)
    detalle          JSONB NOT NULL DEFAULT '{}'::jsonb, -- información adicional del evento en JSONB
    id_usuario       INT REFERENCES usuario(id_usuario), -- usuario que originó la operación (si aplica)
    fecha_evento     TIMESTAMP NOT NULL DEFAULT NOW() -- fecha/hora del evento registrado
); -- fin de la tabla bitacora

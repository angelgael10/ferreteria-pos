-- 06_datos.sql
-- Datos de ejemplo (DML) para sucursales, usuarios, productos, inventario y casos de prueba.

-- =========================================================
-- Sucursales (Cancún, Playa del Carmen, Chetumal)
-- =========================================================
INSERT INTO sucursal (nombre, ciudad, direccion, telefono) VALUES -- inserta las tres sucursales
('Ferretería Cancún Centro', 'Cancún', 'Av. Tulum 100, Centro', '998-000-0001'), -- sucursal en Cancún
('Ferretería Playa Centro', 'Playa del Carmen', 'Calle 12 Norte 200, Centro', '984-000-0002'), -- sucursal en Playa del Carmen
('Ferretería Chetumal Centro', 'Chetumal', 'Av. Héroes 300, Centro', '983-000-0003'); -- sucursal en Chetumal

-- =========================================================
-- Usuarios de ejemplo (clave_hash es demostrativa; en la app se usa hash real)
-- =========================================================
INSERT INTO usuario (nombre, correo, clave_hash, rol, id_sucursal) VALUES -- inserta usuarios por rol
('Admin General', 'admin@ferreteria.local', 'hash_demo_admin', 'administrador', NULL), -- administrador global
('Gerente Cancún', 'gerente.cancun@ferreteria.local', 'hash_demo_gerente', 'gerente', 1), -- gerente de Cancún
('Cajero Cancún 1', 'cajero1.cancun@ferreteria.local', 'hash_demo_cajero', 'cajero', 1), -- cajero 1 en Cancún
('Cajero Cancún 2', 'cajero2.cancun@ferreteria.local', 'hash_demo_cajero', 'cajero', 1), -- cajero 2 en Cancún (para prueba concurrencia)
('Gerente Playa', 'gerente.playa@ferreteria.local', 'hash_demo_gerente', 'gerente', 2), -- gerente de Playa del Carmen
('Cajero Playa', 'cajero.playa@ferreteria.local', 'hash_demo_cajero', 'cajero', 2), -- cajero en Playa del Carmen
('Gerente Chetumal', 'gerente.chetumal@ferreteria.local', 'hash_demo_gerente', 'gerente', 3), -- gerente de Chetumal
('Cajero Chetumal', 'cajero.chetumal@ferreteria.local', 'hash_demo_cajero', 'cajero', 3); -- cajero en Chetumal

-- =========================================================
-- Productos: herramientas (subclase con INHERITS + tipo compuesto + arreglos + JSONB)
-- =========================================================
INSERT INTO producto_herramienta (sku, nombre, descripcion, precio_mxn, unidad_medida, dimensiones, etiquetas, codigos_alternos, especificaciones, material_mango, tipo_herramienta, uso)
VALUES -- inserta una herramienta heredando de producto
('HER-001', 'Martillo uña 16oz', 'Martillo de uña para carpintería', 189.00, 'pieza', -- datos base
 ROW(33.0, 12.0, 3.0, 0.45)::dimensiones_t, -- valor del tipo compuesto dimensiones_t
 ARRAY['martillo','carpinteria','manual'], -- arreglo de etiquetas
 ARRAY['750100000001'], -- arreglo de códigos alternos
 '{"garantia_meses": 12, "marca": "Truper"}'::jsonb, -- especificaciones en JSONB
 'fibra de vidrio', 'manual', 'clavar y retirar clavos'); -- atributos específicos de herramienta

INSERT INTO producto_herramienta (sku, nombre, descripcion, precio_mxn, unidad_medida, dimensiones, etiquetas, codigos_alternos, especificaciones, material_mango, tipo_herramienta, uso)
VALUES -- inserta otra herramienta
('HER-002', 'Desarmador plano 1/4', 'Desarmador plano de precisión', 45.00, 'pieza', -- datos base
 ROW(20.0, 2.5, 2.5, 0.08)::dimensiones_t, -- dimensiones
 ARRAY['desarmador','plano','manual'], -- etiquetas
 ARRAY['750100000002'], -- códigos alternos
 '{"punta": "plana", "medida": "1/4"}'::jsonb, -- especificaciones JSONB
 'plástico', 'manual', 'atornillar'); -- atributos de herramienta

-- =========================================================
-- Productos: materiales (subclase con INHERITS)
-- =========================================================
INSERT INTO producto_material (sku, nombre, descripcion, precio_mxn, unidad_medida, dimensiones, etiquetas, codigos_alternos, especificaciones, tipo_material, presentacion, rendimiento)
VALUES -- inserta un material heredando de producto
('MAT-001', 'Cemento gris 50kg', 'Cemento Portland gris para construcción', 235.00, 'saco', -- datos base
 ROW(60.0, 40.0, 15.0, 50.0)::dimensiones_t, -- dimensiones
 ARRAY['cemento','construccion','obra'], -- etiquetas
 ARRAY['750100000101'], -- códigos alternos
 '{"resistencia": "CPC 30R"}'::jsonb, -- especificaciones JSONB
 'cemento', 'saco 50kg', 'aprox 0.03 m3 por saco'); -- atributos específicos de material

INSERT INTO producto_material (sku, nombre, descripcion, precio_mxn, unidad_medida, dimensiones, etiquetas, codigos_alternos, especificaciones, tipo_material, presentacion, rendimiento)
VALUES -- inserta otro material
('MAT-002', 'Pintura vinílica blanca 19L', 'Pintura vinílica interior/exterior', 720.00, 'cubeta', -- datos base
 ROW(30.0, 30.0, 40.0, 22.0)::dimensiones_t, -- dimensiones
 ARRAY['pintura','vinilica','blanca'], -- etiquetas
 ARRAY['750100000102'], -- códigos alternos
 '{"acabado": "mate", "litros": 19}'::jsonb, -- especificaciones JSONB
 'pintura', 'cubeta 19L', '10-12 m2 por litro'); -- atributos específicos de material

-- =========================================================
-- Productos: eléctricos (subclase con INHERITS)
-- =========================================================
INSERT INTO producto_electrico (sku, nombre, descripcion, precio_mxn, unidad_medida, dimensiones, etiquetas, codigos_alternos, especificaciones, voltaje, consumo_watts, certificacion)
VALUES -- inserta un producto eléctrico heredando de producto
('ELE-001', 'Foco LED 12W', 'Foco LED luz blanca ahorro de energía', 65.00, 'pieza', -- datos base
 ROW(6.0, 6.0, 11.0, 0.05)::dimensiones_t, -- dimensiones
 ARRAY['foco','led','iluminacion'], -- etiquetas
 ARRAY['750100000201'], -- códigos alternos
 '{"lumens": 1100, "vida_horas": 15000}'::jsonb, -- especificaciones JSONB
 '127V', 12.00, 'NOM'); -- atributos específicos de eléctrico

INSERT INTO producto_electrico (sku, nombre, descripcion, precio_mxn, unidad_medida, dimensiones, etiquetas, codigos_alternos, especificaciones, voltaje, consumo_watts, certificacion)
VALUES -- inserta otro producto eléctrico
('ELE-002', 'Extensión eléctrica 5m', 'Extensión de uso rudo 3 contactos', 150.00, 'pieza', -- datos base
 ROW(25.0, 20.0, 6.0, 0.60)::dimensiones_t, -- dimensiones
 ARRAY['extension','electrico','cable'], -- etiquetas
 ARRAY['750100000202'], -- códigos alternos
 '{"contactos": 3, "calibre": "16 AWG"}'::jsonb, -- especificaciones JSONB
 '127V', 1800.00, 'NOM'); -- atributos específicos de eléctrico

-- =========================================================
-- Inventario por sucursal (incluye caso de último artículo para concurrencia)
-- Se asume que los ids de producto asignados son 1..6 en orden de inserción.
-- =========================================================
INSERT INTO inventario (id_sucursal, id_producto, stock, stock_minimo) VALUES -- inserta existencias iniciales
(1, 1, 15, 5), -- Cancún: martillo
(1, 2, 30, 10), -- Cancún: desarmador
(1, 3, 20, 5), -- Cancún: cemento
(1, 4, 10, 3), -- Cancún: pintura
(1, 5, 50, 10), -- Cancún: foco LED
(1, 6, 1, 2),  -- Cancún: extensión con UNA sola pieza (para prueba de concurrencia)
(2, 1, 10, 5), -- Playa: martillo
(2, 3, 12, 5), -- Playa: cemento
(2, 5, 25, 10), -- Playa: foco LED
(3, 2, 20, 10), -- Chetumal: desarmador
(3, 4, 8, 3), -- Chetumal: pintura
(3, 6, 5, 2); -- Chetumal: extensión

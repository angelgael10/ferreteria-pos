# Arquitectura del sistema

## Visión general

Sistema web MVC para inventario y punto de venta multisucursal (Cancún, Playa del Carmen, Chetumal).

- **Cliente (Frontend):** React + Vite. Vistas dinámicas, carrito y búsqueda en vivo (manipulación del DOM). Consume la API REST del backend.
- **Servidor (Backend):** Node.js + Express. Expone API REST, aplica validaciones y reglas de negocio, y se comunica con PostgreSQL.
- **Base de datos:** PostgreSQL 18 en Docker. Modelo relacional con extensiones OO (herencia, tipos compuestos, arreglos, JSONB), lógica en PL/pgSQL (funciones/triggers/vistas) y control transaccional/concurrencia.

## Flujo de una petición (MVC/API)

1. El usuario interactúa con la vista React (evento DOM).
2. El frontend envía petición HTTP a la API Express.
3. La ruta dirige al controlador correspondiente.
4. El controlador valida entrada y llama al modelo/servicio.
5. El modelo ejecuta SQL/funciones en PostgreSQL.
6. La respuesta JSON vuelve al frontend y se actualiza la vista.

## Módulos implementados

- Autenticación con token HMAC y roles (Administrador, Gerente, Cajero).
- Catálogo de productos e inventario por sucursal.
- Punto de venta (carrito, ventas) y traspasos entre sucursales.
- Reportes consolidados con control de rol.
- Consumo de servicio externo: tipo de cambio USD/MXN de Banxico SIE (serie SF43718), con token `Bmx-Token`.

## Base de datos (resumen)

- Tablas núcleo: sucursales, usuarios, productos (jerarquía por herencia), inventario, ventas/detalle, traspasos, bitácora.
- Características OO: `INHERITS`, tipo compuesto, `text[]`, `jsonb`.
- Integridad/concurrencia: funciones, triggers, transacciones y `SELECT ... FOR UPDATE`.
- Distribuida (sprint 3): particionamiento por sucursal, replicación, `postgres_fdw`, 2PC (`PREPARE TRANSACTION`).
- Recuperación: PITR con `pg_basebackup` + archivado de WAL.

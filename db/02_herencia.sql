-- 02_herencia.sql
-- Herencia de tablas en PostgreSQL (BD orientada a objetos).
-- Se crean subclases que heredan de la tabla base "producto" usando INHERITS.

-- =========================================================
-- Subclase: herramienta (hereda todos los campos de producto)
-- =========================================================
CREATE TABLE producto_herramienta ( -- crea la tabla específica para herramientas
    material_mango   VARCHAR(80), -- material del mango (madera, fibra, acero, etc.)
    tipo_herramienta VARCHAR(80), -- tipo de herramienta (manual, eléctrica de mano, medición, etc.)
    uso              VARCHAR(120) -- uso principal recomendado
) INHERITS (producto); -- hereda columnas y comportamiento base de la tabla producto

-- Restricción de llave primaria propia de la tabla hija (las PK no se heredan en PostgreSQL)
ALTER TABLE producto_herramienta ADD CONSTRAINT pk_producto_herramienta PRIMARY KEY (id_producto); -- define PK en la hija
-- Garantiza SKU único también en esta tabla hija
ALTER TABLE producto_herramienta ADD CONSTRAINT uq_producto_herramienta_sku UNIQUE (sku); -- SKU único en herramientas

-- =========================================================
-- Subclase: material (hereda todos los campos de producto)
-- =========================================================
CREATE TABLE producto_material ( -- crea la tabla específica para materiales de construcción
    tipo_material    VARCHAR(80), -- tipo de material (cemento, arena, madera, pintura, etc.)
    presentacion     VARCHAR(80), -- presentación (saco, cubeta, pieza, metro, etc.)
    rendimiento      VARCHAR(120) -- rendimiento aproximado declarado por el fabricante
) INHERITS (producto); -- hereda columnas y comportamiento base de la tabla producto

-- Restricción de llave primaria propia de la tabla hija
ALTER TABLE producto_material ADD CONSTRAINT pk_producto_material PRIMARY KEY (id_producto); -- define PK en la hija
-- Garantiza SKU único también en esta tabla hija
ALTER TABLE producto_material ADD CONSTRAINT uq_producto_material_sku UNIQUE (sku); -- SKU único en materiales

-- =========================================================
-- Subclase: eléctrico (hereda todos los campos de producto)
-- =========================================================
CREATE TABLE producto_electrico ( -- crea la tabla específica para productos eléctricos
    voltaje          VARCHAR(40), -- voltaje de operación (127V, 220V, etc.)
    consumo_watts    NUMERIC(10,2), -- consumo eléctrico en watts
    certificacion    VARCHAR(80) -- certificación o norma (NOM, UL, etc.)
) INHERITS (producto); -- hereda columnas y comportamiento base de la tabla producto

-- Restricción de llave primaria propia de la tabla hija
ALTER TABLE producto_electrico ADD CONSTRAINT pk_producto_electrico PRIMARY KEY (id_producto); -- define PK en la hija
-- Garantiza SKU único también en esta tabla hija
ALTER TABLE producto_electrico ADD CONSTRAINT uq_producto_electrico_sku UNIQUE (sku); -- SKU único en eléctricos

-- Nota: consultar SELECT * FROM ONLY producto devuelve solo filas de la tabla base;
-- consultar SELECT * FROM producto devuelve filas de la base y de todas las hijas (herencia).

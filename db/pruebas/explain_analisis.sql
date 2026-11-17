-- pruebas/explain_analisis.sql
-- Planes de ejecución y ejemplo de índice para evidencia (Unidad III BD).
-- Ejecutar en psql y capturar salidas como evidencia real.

-- 1) Consulta de existencias por sucursal (usa la vista) sin índice adicional específico
EXPLAIN ANALYZE
SELECT * FROM v_existencias_sucursal WHERE id_sucursal = 1; -- plan de búsqueda por sucursal

-- 2) Búsqueda de productos por nombre (puede beneficiarse de índice)
EXPLAIN ANALYZE
SELECT id_producto, sku, nombre FROM producto WHERE nombre ILIKE '%cemento%'; -- búsqueda por texto

-- 3) Crear índice para acelerar búsquedas por nombre (ejemplo de optimización)
CREATE INDEX IF NOT EXISTS idx_producto_nombre ON producto (nombre); -- índice btree por nombre

-- 4) Repetir consulta para comparar plan tras índice (según datos puede variar)
EXPLAIN ANALYZE
SELECT id_producto, sku, nombre FROM producto WHERE nombre ILIKE '%cemento%'; -- comparar plan

-- 5) Consulta de ventas por sucursal (vista agregada)
EXPLAIN ANALYZE
SELECT * FROM v_ventas_por_sucursal; -- plan de agregación

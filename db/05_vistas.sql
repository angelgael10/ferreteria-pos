-- 05_vistas.sql
-- Vistas para consultas frecuentes (existencias por sucursal y consolidado).

-- =========================================================
-- Vista: existencias por sucursal (producto, sucursal, cantidad)
-- =========================================================
CREATE OR REPLACE VIEW v_existencias_sucursal AS -- crea o reemplaza la vista de existencias
SELECT -- selecciona las columnas a mostrar
    s.id_sucursal, -- identificador de la sucursal
    s.nombre      AS sucursal, -- nombre de la sucursal
    s.ciudad, -- ciudad de la sucursal
    p.id_producto, -- identificador del producto
    p.sku, -- código SKU del producto
    p.nombre      AS producto, -- nombre del producto
    p.precio_mxn, -- precio del producto en pesos
    i.stock, -- cantidad disponible en inventario
    i.stock_minimo -- stock mínimo configurado
FROM inventario i -- parte de la tabla inventario
JOIN sucursal s ON s.id_sucursal = i.id_sucursal -- une con sucursal para obtener nombre/ciudad
JOIN producto p ON p.id_producto = i.id_producto; -- une con producto para obtener datos del producto

-- =========================================================
-- Vista: consolidado de existencias totales por producto (todas las sucursales)
-- =========================================================
CREATE OR REPLACE VIEW v_existencias_consolidado AS -- crea o reemplaza la vista consolidada
SELECT -- selecciona las columnas a mostrar
    p.id_producto, -- identificador del producto
    p.sku, -- código SKU del producto
    p.nombre      AS producto, -- nombre del producto
    SUM(i.stock)  AS stock_total, -- suma de existencias en todas las sucursales
    COUNT(i.id_sucursal) AS sucursales_con_stock -- número de sucursales con registro del producto
FROM inventario i -- parte de la tabla inventario
JOIN producto p ON p.id_producto = i.id_producto -- une con producto
GROUP BY p.id_producto, p.sku, p.nombre; -- agrupa por producto para consolidar

-- =========================================================
-- Vista: resumen de ventas por sucursal
-- =========================================================
CREATE OR REPLACE VIEW v_ventas_por_sucursal AS -- crea o reemplaza la vista de ventas por sucursal
SELECT -- selecciona las columnas a mostrar
    s.id_sucursal, -- identificador de la sucursal
    s.nombre      AS sucursal, -- nombre de la sucursal
    COUNT(v.id_venta) AS numero_ventas, -- cantidad de ventas realizadas
    COALESCE(SUM(v.total), 0) AS total_vendido -- monto total vendido (0 si no hay ventas)
FROM sucursal s -- parte de la tabla sucursal
LEFT JOIN venta v ON v.id_sucursal = s.id_sucursal AND v.estado = 'completada' -- une ventas completadas
GROUP BY s.id_sucursal, s.nombre; -- agrupa por sucursal

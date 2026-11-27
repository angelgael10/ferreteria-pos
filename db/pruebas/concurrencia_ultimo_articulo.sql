-- pruebas/concurrencia_ultimo_articulo.sql
-- Prueba de concurrencia: dos cajas intentan vender el último artículo (id_producto=6, sucursal=1, stock=1).
-- Ejecutar en DOS sesiones/terminales psql conectadas a la misma base.
-- Objetivo: una transacción confirma y la otra falla; el stock nunca queda negativo.

-- ===== SESIÓN A (ejecutar paso a paso) =====
-- BEGIN; -- inicia transacción A
-- SELECT registrar_venta('V-CONC-A', 1, 3, '[{"id_producto":6,"cantidad":1,"precio_unitario":99}]'::jsonb);
-- -- No hacer COMMIT aún; dejar abierta para simular concurrencia y luego COMMIT;

-- ===== SESIÓN B (ejecutar mientras A sigue abierta) =====
-- BEGIN; -- inicia transacción B
-- SELECT registrar_venta('V-CONC-B', 1, 4, '[{"id_producto":6,"cantidad":1,"precio_unitario":99}]'::jsonb);
-- -- Esta sesión quedará bloqueada por FOR UPDATE hasta que A haga COMMIT/ROLLBACK;
-- -- al continuar, debe fallar con "Stock insuficiente..." porque A ya descontó.
-- COMMIT; -- o ROLLBACK según resultado

-- ===== Verificación (después) =====
-- SELECT stock FROM inventario WHERE id_sucursal=1 AND id_producto=6; -- debe ser 0, nunca negativo
-- SELECT * FROM venta WHERE folio LIKE 'V-CONC-%'; -- solo una venta completada
-- SELECT * FROM bitacora ORDER BY id_bitacora DESC LIMIT 10; -- evidencia en bitácora

-- Nota de aislamiento: PostgreSQL usa READ COMMITTED por defecto; el bloqueo FOR UPDATE
-- serializa el acceso a la fila de inventario, evitando la sobreventa en este caso.
-- Para mayor estrictez podría usarse SERIALIZABLE, reintentando ante errores de serialización.

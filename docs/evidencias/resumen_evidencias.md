# Evidencias ejecutadas (2026-11-17)

Resultados reales obtenidos al ejecutar el proyecto en el equipo del alumno (Docker `ferreteria_db`, PostgreSQL 18.6, host `localhost:5433`, BD `ferreteria`).

## 1. Prueba de concurrencia (U.IV BD) — `db/pruebas/concurrencia_ultimo_articulo.sql`

Escenario: producto 6 (`ELE-002`) en sucursal 1 (Cancún) con **stock = 1**. Dos sesiones:
- Aislamiento mostrado: `SHOW transaction_isolation;` → **read committed**.
- Caja 1: `BEGIN; SELECT registrar_venta('V-CONC-A', 1, 3, ...);` → devolvió `3` (id de venta) y **no** hizo COMMIT.
- Caja 2: `BEGIN; SELECT registrar_venta('V-CONC-B', 1, 4, ...);` → **se quedó esperando**.
- Verificación del bloqueo en `pg_stat_activity`:
  - Sesión A: `state = idle in transaction`
  - Sesión B: `state = active`, `wait_event_type = Lock`, `wait_event = transactionid`
- Caja 1: `COMMIT;`
- Caja 2: `ERROR: Stock insuficiente para producto 6: disponible 0, solicitado 1` → `ROLLBACK;`

Resultado final:
```
 id_sucursal | id_producto | stock
-------------+-------------+-------
           3 |           6 |     5
           1 |           6 |     0
```
```
  folio   | total  |   estado
----------+--------+------------
 V-CONC-A | 150.00 | completada
```
Conclusión: con `READ COMMITTED` + `SELECT ... FOR UPDATE`, la segunda transacción espera a que se libere la fila, revalida el stock y se rechaza. **Una venta se confirma, la otra no, y el stock nunca queda negativo.**

> Nota: en la bitácora aparecen dos eventos por venta: uno del trigger `trg_venta_bitacora` (`INSERT`) y otro de la función (`VENTA`). Es auditoría redundante intencional; puede unificarse si se requiere.

## 2. Planes de ejecución, índices y almacenamiento (U.III BD)

Archivo de salida completo: `docs/evidencias/explain_resultados.txt`.

Consulta de existencias por sucursal (vista `v_existencias_sucursal`):
- Usa `Index Scan using sucursal_pkey` + `Bitmap Index Scan on inventario_id_sucursal_id_producto_key` + `Hash Join`.
- Observación: la tabla `producto` se resuelve con `Append` sobre las tablas hijas (herencia: `producto_herramienta`, `producto_material`, `producto_electrico`).

Búsqueda `nombre ILIKE '%cemento%'` antes y después de `CREATE INDEX idx_producto_nombre ON producto (nombre)`:
- En ambos casos el plan fue `Append` con `Seq Scan` en cada tabla hija.
- **Interpretación honesta:** el índice btree no se usa porque (a) el patrón `%...%` tiene comodín inicial (no es búsqueda por prefijo) y (b) con `INHERITS` los datos viven en las tablas hijas y el índice creado en la tabla padre no cubre esas filas. Para mejorarlo se requeriría un índice de trigramas (`pg_trgm` + GIN) en cada tabla hija, o rediseñar la búsqueda. Esta observación sirve para justificar la elección del índice y explicar el plan en la defensa.

Reporte consolidado `v_ventas_por_sucursal`: `HashAggregate` + `Hash Left Join` (3 sucursales).

Almacenamiento (`docs/evidencias/almacenamiento_resultados.txt`, tras `ANALYZE`):
```
       relname        | relpages | filas_estimadas | bytes
----------------------+----------+-----------------+-------
 bitacora             |        1 |              21 |  8192
 inventario           |        1 |              12 |  8192
 producto             |        0 |               0 |     0
 producto_electrico   |        1 |               2 |  8192
 producto_herramienta |        1 |               2 |  8192
 producto_material    |        1 |               2 |  8192
 venta                |        1 |               3 |  8192
```
- `producto` (padre) tiene `relpages = 0` porque las filas están en las hijas: evidencia directa de la herencia.
- Tablas TOAST existentes: `pg_toast.pg_toast_16436` (producto) y `pg_toast.pg_toast_16613` (bitacora); `venta` no tiene TOAST.
- `block_size = 8192` bytes (páginas de 8 KB) y tablespaces `pg_default`/`pg_global`.

## 3. Traspaso entre sucursales (U.II/U.IV BD) — `registrar_traspaso`

Ejecución real: `T-DEMO-01`, origen sucursal 1 (Cancún), destino sucursal 2 (Playa), usuario 2 (Gerente Cancún), producto 3 (cemento), cantidad 2. Salida completa en `docs/evidencias/traspaso_resultados.txt`.

Antes:
```
 id_sucursal | id_producto | stock
-------------+-------------+-------
           1 |           3 |    20
           2 |           3 |    12
```
Después:
```
           1 |           3 |    18
           2 |           3 |    14
```
Traspaso registrado:
```
   folio   | sucursal_origen | sucursal_destino |   estado
-----------+-----------------+------------------+------------
 T-DEMO-01 |               1 |                2 | completado
```
Bitácora: eventos `UPDATE` de inventario en origen/destino y `TRASPASO` con id 1. Conclusión: la operación es atómica (se descuenta en origen y suma en destino dentro de la misma transacción).

> Nota de ejecución: los dos primeros intentos fallaron por el escapado de comillas JSON en PowerShell; se corrigió pasando el SQL desde un archivo (`Get-Content -Raw archivo.sql | docker exec -i ... psql`). Queda documentado como aprendizaje real.

## 4. Consumo de API externa Banxico (Web U.III)

Prueba real sin token (`/api/banxico/tipo-cambio`):
```json
{
  "ok": false,
  "aviso": "BANXICO_TOKEN no configurado. Configura el token para consultar el tipo de cambio."
}
```
Conclusión: el sistema **no se cae** si falta el token o la API falla; muestra un aviso controlado. Para la evidencia de consumo exitoso, registrar un token gratuito en Banxico SIE y colocarlo en `app/backend/.env` como `BANXICO_TOKEN=...`, reiniciar el backend y capturar la respuesta con `fecha` y `valor`.

## 5. Recuperación a un punto en el tiempo — PITR (U.IV BD)

Demostración completa en un clúster aparte (para no afectar la BD del proyecto). Salida completa en `docs/evidencias/pitr_resultados.txt`.

- Origen `pitr_src` (puerto 5434): `archive_mode = on`, `wal_level = replica`, `archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'`.
- Respaldo base con `pg_basebackup -D /backup/base -Xs -P`: **31364 kB** (100%).
- Antes del punto: `fila-1` y `fila-2` (01:42:06.02). Punto de restauración `antes_fila3` en LSN `0/30076A8`; tiempo objetivo `2026-11-17 01:42:06.042778+00`.
- Después del punto: `fila-3` (01:42:10.140282+00), para comprobar que no se recupera.
- WAL archivado: **5 segmentos**, `failed_count = 0` (000000010000000000000001 a ...0004 + archivo `.backup`).
- Restauración en `pitr_restore` (puerto 5435) con `recovery_target_time` y `recovery_target_action = 'promote'`.
- Log real: `recovery stopping before commit of transaction 757, time 2026-11-17 01:42:07.570497+00`.
- Verificación: `pg_is_in_recovery = f` (promovido) y **solo 2 filas** (`fila-1`, `fila-2`); `fila-3` no existe.

> Aprendizaje real: `recovery.signal` debe crearse **antes** del primer arranque del contenedor restaurado. Si se crea después, PostgreSQL ya avanzó el WAL y falla con `recovery ended before configured recovery target was reached`; se rehízo la restauración desde cero.

## 6. Base de datos distribuida (U.V BD)

Demostración con tres contenedores PostgreSQL 18.6 en la red Docker `dist_net`; salida completa en `docs/evidencias/distribuida_resultados.txt`.

- **Topología:** `dist_a` (host 5436, primario), `dist_b` (host 5437, nodo remoto) y `dist_replica` (host 5438, streaming). `max_prepared_transactions = 10`, `wal_level = replica`.
- **Particionamiento:** `venta_part` por `LIST (id_sucursal)` con particiones Cancún/Playa/Chetumal; 4 filas repartidas 2/1/1. El `EXPLAIN` de `id_sucursal = 2` solo lee `venta_part_playa` (poda).
- **Replicación:** `pg_stat_replication` muestra `state = streaming` y `sync_state = async`; la fila insertada en A (`id_producto = 998`) apareció en la réplica, que responde `pg_is_in_recovery = t`.
- **FDW:** servidor `srv_b` + foreign table `inventario_b_remoto`; desde A se leyeron las filas de `inventario_nodo_b` en B.
- **2PC:** `traspaso_2pc_a2` (nodo A) y `traspaso_2pc_b2` (nodo B) visibles en `pg_prepared_xacts`; después `COMMIT PREPARED` en ambos y filas 502 verificadas.
- **Limitación real:** `postgres_fdw` no permite `PREPARE TRANSACTION` sobre tablas foráneas (`cannot PREPARE a transaction that has operated on postgres_fdw foreign tables`); el 2PC se hizo con dos transacciones preparadas explícitas (coordinador manual).

## 7. Capturas pendientes por el alumno (reales)
- Pantallas del frontend: login, búsqueda en vivo, inventario por sucursal, POS con carrito y venta confirmada, reportes y aviso de Banxico.
- Sesiones de la prueba de concurrencia (A esperando/COMMIT, B rechazada) — ya generadas en terminal; tomar captura.
- `EXPLAIN ANALYZE` y consultas de almacenamiento (salidas ya guardadas en `docs/evidencias/`).
- Traspaso antes/después, PITR y BD distribuida (salidas reales ya guardadas en `docs/evidencias/`).
- Repositorio en GitHub con ramas/commits y tablero del proyecto.

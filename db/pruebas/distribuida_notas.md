# Base de datos distribuida (forma simple) - Evidencias U.V

> Objetivo: cumplir particionamiento por sucursal, replicación en Docker, consultas distribuidas con `postgres_fdw` y transacción distribuida con `PREPARE TRANSACTION` (2PC), de la manera más simple.

## Resultados reales (2026-11-17)

Ejecutado con tres contenedores PostgreSQL 18.6 en la red `dist_net`:
- `dist_a` (puerto host 5436): primario de replicación y nodo local.
- `dist_b` (puerto host 5437): nodo remoto para FDW y 2PC.
- `dist_replica` (puerto host 5438): réplica streaming del nodo A.

- **Particionamiento:** `venta_part` por `LIST (id_sucursal)` con 3 particiones; 4 filas repartidas 2/1/1. `EXPLAIN` con `id_sucursal = 2` solo lee `venta_part_playa` (poda de particiones).
- **Replicación:** `pg_stat_replication` en `streaming` (async); la fila insertada en el primario apareció en la réplica, que responde `pg_is_in_recovery = t`.
- **FDW:** servidor `srv_b` + foreign table `inventario_b_remoto`; desde A se consultan las filas de `inventario_nodo_b` en B.
- **2PC:** `traspaso_2pc_a2` preparada en A y `traspaso_2pc_b2` en B, visibles en `pg_prepared_xacts`; luego `COMMIT PREPARED` en ambos y verificación de filas.
- **Limitación real:** `postgres_fdw` devuelve `ERROR: cannot PREPARE a transaction that has operated on postgres_fdw foreign tables`; por eso el 2PC se demostró con dos transacciones preparadas explícitas (coordinador manual).

Salida completa: `docs/evidencias/distribuida_resultados.txt`.

## 1. Particionamiento por sucursal
Ejemplo (tabla particionada por lista de sucursal):
```sql
-- Ejemplo conceptual: particionar inventario/ventas por id_sucursal
CREATE TABLE venta_part (LIKE venta INCLUDING ALL) PARTITION BY LIST (id_sucursal);
CREATE TABLE venta_cancun PARTITION OF venta_part FOR VALUES IN (1);
CREATE TABLE venta_playa  PARTITION OF venta_part FOR VALUES IN (2);
CREATE TABLE venta_chetumal PARTITION OF venta_part FOR VALUES IN (3);
```
Evidencia: mostrar `\d+ venta_part` y en qué partición cae cada fila.

## 2. Replicación en Docker (streaming, simple)
- Levantar un primario y una réplica con `postgres:18` en `docker-compose` (servicios separados, volúmenes distintos).
- Configurar `wal_level=replica`, usuario de replicación, `pg_hba.conf` y `primary_conninfo`/`standby.signal` en réplica.
- Evidencia: insertar en primario y consultar en réplica (solo lectura).

## 3. Consultas distribuidas con postgres_fdw
```sql
CREATE EXTENSION postgres_fdw;
CREATE SERVER srv_playa FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'db_playa', dbname 'ferreteria', port '5432');
CREATE USER MAPPING FOR ferreteria SERVER srv_playa OPTIONS (user 'ferreteria', password '...');
CREATE FOREIGN TABLE inventario_playa (id_inventario int, id_sucursal int, id_producto int, stock int, stock_minimo int, actualizado_en timestamp)
  SERVER srv_playa OPTIONS (schema_name 'public', table_name 'inventario');
SELECT * FROM inventario_playa; -- consulta remota
```

## 4. Transacción distribuida en dos fases (2PC)
```sql
-- Requiere max_prepared_transactions > 0 en todos los nodos
BEGIN;
-- operaciones locales y/o remotas vía FDW
PREPARE TRANSACTION 'traspaso_001';
-- verificar en otros nodos/estado y luego:
COMMIT PREPARED 'traspaso_001'; -- o ROLLBACK PREPARED
```
Evidencia: mostrar `pg_prepared_xacts` y el resultado del traspaso coordinado.

## Nota de ejecución
Montar 3 nodos+réplica requiere un `docker-compose` extendido y configuración de red; ejecutar paso a paso, capturar errores/salidas reales y documentarlos en el reporte.

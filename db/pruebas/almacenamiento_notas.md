# Estructura de almacenamiento en PostgreSQL (evidencia U.III BD)

## Tablespaces
- Un tablespace define la ubicación en disco donde se almacenan archivos de datos.
- Por defecto PostgreSQL usa `pg_default` (datos) y `pg_global` (catálogos compartidos).
- Consulta: `SELECT spcname, pg_tablespace_location(oid) FROM pg_tablespace;`
- Se puede crear otro con `CREATE TABLESPACE ts_ferreteria LOCATION '/ruta';` y asignar tablas/índices.

## Páginas (pages)
- PostgreSQL almacena datos en páginas de tamaño fijo (normalmente 8 KB).
- Cada tabla/índice es un archivo dividido en páginas; las filas (tuplas) se guardan dentro de páginas.
- Consulta de tamaño: `SELECT pg_relation_size('producto');` y `SELECT relpages FROM pg_class WHERE relname='producto';`

## TOAST (The Oversized-Attribute Storage Technique)
- Cuando una fila excede el tamaño de página, valores grandes (TEXT, JSONB, arreglos grandes) se comprimen y/o se mueven a una tabla TOAST asociada.
- En este proyecto `descripcion` (TEXT), `especificaciones` (JSONB) y arreglos pueden usar TOAST.
- Consulta: `SELECT relname, reltoastrelid::regclass FROM pg_class WHERE relname='producto';`

## Cómo evidenciar (comandos a ejecutar)
```sql
SELECT spcname, pg_tablespace_location(oid) FROM pg_tablespace;
SELECT relname, relpages, pg_relation_size(oid) AS bytes FROM pg_class WHERE relname IN ('producto','inventario','venta');
SELECT relname, reltoastrelid::regclass AS toast_table FROM pg_class WHERE relname IN ('producto','venta','bitacora');
```
Tomar capturas de los resultados para el documento.

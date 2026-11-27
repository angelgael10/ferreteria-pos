# Características del motor y gestor, arreglos y conjuntos

Este documento reúne la evidencia solicitada por las unidades I y II de Bases de Datos: características del motor y gestor utilizado, datos complejos, herencia, arreglos y conjuntos.

## 1. Motor y gestor

| Aspecto | Valor observado | Evidencia |
|---|---|---|
| Motor | PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2) | `SELECT current_setting('server_version');` |
| Contenedor | Imagen `postgres:18`, contenedor `ferreteria_db`, puerto host 5433 | `docker-compose.yml` líneas 2-12 |
| Gestor | pgAdmin no se necesita para la ejecución; la administración se hace con `psql`, scripts SQL numerados y Docker Compose | `docker-compose.yml`; `db/01` a `db/07` |
| Persistencia | Volumen `pgdata` montado en `/var/lib/postgresql` | `docker-compose.yml` líneas 8-10 |
| Salud | Healthcheck con `pg_isready` cada 5 segundos | `docker-compose.yml` líneas 11-15 |

Salida real de la versión:

```text
            version
-------------------------------
 18.6 (Debian 18.6-1.pgdg13+2)
(1 row)
```

## 2. Características implementadas

| Característica | Dónde está | Evidencia |
|---|---|---|
| Modelo relacional normalizado | `db/01_esquema.sql` | Claves primarias, foráneas, `UNIQUE`, `CHECK` y `NUMERIC`. |
| Herencia de tablas | `db/02_herencia.sql` | `producto` con `INHERITS` hacia herramienta, material y eléctrico. |
| Tipo compuesto | `db/01_esquema.sql` | `dimensiones_t` usado en productos. |
| Arreglos | `db/01_esquema.sql` y `db/06_datos.sql` | `etiquetas TEXT[]` y `codigos_alternos TEXT[]`. |
| JSONB | `db/01_esquema.sql` y `db/06_datos.sql` | `especificaciones JSONB` y `detalle JSONB` en bitácora. |
| Vistas | `db/05_vistas.sql` | `v_existencias_sucursal`, `v_existencias_consolidado` y `v_ventas_por_sucursal`. |
| Procedimientos y funciones | `db/03_funciones.sql` | `registrar_venta`, `registrar_traspaso` y helpers. |
| Triggers | `db/04_triggers.sql` | Descuento de stock y bitácora. |
| Transacciones y concurrencia | `db/03_funciones.sql`; `db/pruebas/concurrencia_ultimo_articulo.sql` | `SELECT ... FOR UPDATE`; prueba con dos sesiones. |
| Recuperación | `db/pruebas/pitr_respaldo.md`; `docs/evidencias/pitr_resultados.txt` | `pg_basebackup` + WAL. |
| Distribución | `db/pruebas/distribuida_notas.md`; `docs/evidencias/distribuida_resultados.txt` | Particiones LIST, streaming, `postgres_fdw` y 2PC. |

## 3. Arreglos

Los productos guardan etiquetas como arreglo de texto. Consulta ejecutada:

```sql
SELECT id_producto, nombre, etiquetas, especificaciones->>'material' AS material
FROM producto_herramienta
WHERE etiquetas IS NOT NULL
ORDER BY id_producto;
```

Salida real:

```text
 id_producto |        nombre        |           etiquetas           | material
-------------+----------------------+-------------------------------+----------
           1 | Martillo uña 16oz    | {martillo,carpinteria,manual} |
           2 | Desarmador plano 1/4 | {desarmador,plano,manual}     |
(2 rows)
```

## 4. Conjuntos

PostgreSQL permite tratar los elementos de un arreglo como un conjunto con `UNNEST`. La consulta siguiente devuelve etiquetas únicas, porque `DISTINCT` aplica semántica de conjunto:

```sql
SELECT DISTINCT unnest(etiquetas) AS etiqueta
FROM producto
ORDER BY 1;
```

Salida real, 17 etiquetas únicas:

```text
   etiqueta
--------------
 blanca
 cable
 carpinteria
 cemento
 construccion
 desarmador
 electrico
 extension
 foco
 iluminacion
 led
 manual
 martillo
 obra
 pintura
 plano
 vinilica
(17 rows)
```

Esta misma técnica se usa en la lógica de demostración para contar o filtrar productos por etiqueta sin crear una tabla separada por cada etiqueta.

## 5. Verificación

Los comandos se ejecutaron contra `ferreteria_db` con:

```powershell
docker exec ferreteria_db psql -U ferreteria -d ferreteria -P pager=off -c "..."
```

Las salidas quedaron reproducibles con la base cargada desde `db/01` a `db/07`.

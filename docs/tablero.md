# Tablero de seguimiento (GitHub Projects)

- Repositorio: https://github.com/angelgael10/ferreteria-pos
- Tablero: https://github.com/users/angelgael10/projects/1
- Estado final: 18 issues, **18 cerrados**. Las tres columnas del campo **Status** quedaron con Todo = 0, In Progress = 0 y Done = 18.

## Columnas

| Columna | Contenido final |
|---|---|
| **Todo** | Sin tarjetas |
| **In Progress** | Sin tarjetas |
| **Done** | HU-01 a HU-10, tareas técnicas #11–#15, capturas #16, API Banxico #17 y repo #18 |

## Tarjetas por historia de usuario

| Tarjeta | Issue | Sprint | Estado | Evidencia |
|---|---|---|---|---|
| HU-01 Autenticación por rol | #1 | 1 | Hecho | Login con token HMAC, nav por rol y 403 en reportes para cajero |
| HU-02 Catálogo de productos | #2 | 1 | Hecho | Herencia y API `/api/productos` con alta/edición validadas |
| HU-03 Existencias por sucursal | #3 | 1 | Hecho | Vista `v_existencias_sucursal` e inventario en el frontend |
| HU-04 Punto de venta con carrito | #4 | 2 | Hecho | POS con carrito y `registrar_venta` |
| HU-05 Búsqueda en vivo | #5 | 2 | Hecho | Búsqueda sin recargar + captura `03-busqueda-en-vivo.png` |
| HU-06 Traspasos entre sucursales | #6 | 2 | Hecho | `T-DEMO-01` (20→18 y 12→14) en `traspaso_resultados.txt` |
| HU-07 Concurrencia del último artículo | #7 | 2 | Hecho | `V-CONC-A`/`V-CONC-B` y repetición `V-CONC-LIVE-A`/`V-CONC-LIVE-B` |
| HU-08 Consulta externa Banxico | #8 | 3 | Hecho | Serie SF43718 en `api_externa_resultados.txt` y captura `09-api-banxico.png` |
| HU-09 Respaldo y recuperación PITR | #9 | 3 | Hecho | `pitr_resultados.txt` |
| HU-10 Reportes consolidados | #10 | 4 | Hecho | Vista `v_ventas_por_sucursal` y captura `08-reportes.png` |

## Tarjetas técnicas

| Tarjeta | Issue | Sprint | Estado | Evidencia |
|---|---|---|---|---|
| Particionamiento por sucursal | #11 | 3 | Hecho | Poda en `distribuida_resultados.txt` |
| Replicación streaming | #12 | 3 | Hecho | `pg_stat_replication` y fila replicada |
| Consultas con `postgres_fdw` | #13 | 3 | Hecho | Foreign table `inventario_b_remoto` |
| 2PC con transacciones preparadas | #14 | 3 | Hecho | `pg_prepared_xacts` y `COMMIT PREPARED` en ambos nodos |
| EXPLAIN/índices y almacenamiento | #15 | 3 | Hecho | `explain_resultados.txt` y `almacenamiento_resultados.txt` |
| Capturas de pantalla | #16 | 4 | Hecho | 13 PNG en `docs/evidencias/capturas/` |
| API externa Banxico SIE | #17 | 3 | Hecho | `BANXICO_SERIE=SF43718`; `19.7040` MXN/USD con fecha `25/11/2026` |
| Repositorio remoto y tablero | #18 | 4 | Hecho | Repo y Project públicos; commits publicados |

## Comandos usados para el cierre

```powershell
gh issue close 8 --repo angelgael10/ferreteria-pos --comment "Consulta de tipo de cambio Banxico integrada"
gh issue close 16 --repo angelgael10/ferreteria-pos --comment "13 capturas reales"
gh issue close 17 --repo angelgael10/ferreteria-pos --comment "Consulta Banxico con token configurado"
gh project item-edit 1 --owner angelgael10 --url https://github.com/angelgael10/ferreteria-pos/issues/8 --field "Status" --value "Done"
gh project item-edit 1 --owner angelgael10 --url https://github.com/angelgael10/ferreteria-pos/issues/16 --field "Status" --value "Done"
gh project item-edit 1 --owner angelgael10 --url https://github.com/angelgael10/ferreteria-pos/issues/17 --field "Status" --value "Done"
```

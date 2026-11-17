# Tablero de seguimiento (GitHub Projects)

Tablero publicado y vinculado al repositorio:

- Repositorio: https://github.com/angelgael10/ferreteria-pos
- Tablero: https://github.com/users/angelgael10/projects/1
- Issues: 18 en total; 15 cerrados y 3 abiertos (HU-08, capturas y token).

## Columnas

GitHub Projects usa el campo **Status** con tres columnas:

| Columna | Contenido |
|---|---|
| **Todo** | Backlog y pendientes de evidencia: issues #16 (capturas) y #17 (token) |
| **In Progress** | HU-08 Tipo de cambio Banxico: issue #8 |
| **Done** | HU-01 a HU-07, HU-09, HU-10 y tareas técnicas: issues #1–#7, #9–#15 y #18 |

## Tarjetas por historia de usuario

| Tarjeta | Issue | Sprint | Estado | Evidencia |
|---|---|---|---|---|
| HU-01 Autenticación por rol | #1 | 1 | Hecho | Login y rutas por rol en `app/backend/src/routes/auth.js` y frontend |
| HU-02 Catálogo de productos | #2 | 1 | Hecho | Tablas de producto con herencia y API `/api/productos` |
| HU-03 Existencias por sucursal | #3 | 1 | Hecho | Vista `v_existencias_sucursal` e inventario en el frontend |
| HU-04 Punto de venta con carrito | #4 | 2 | Hecho | POS y función `registrar_venta` |
| HU-05 Búsqueda en vivo | #5 | 2 | Hecho | Búsqueda en el frontend + API de productos |
| HU-06 Traspasos entre sucursales | #6 | 2 | Hecho | `T-DEMO-01` (20→18 y 12→14) en `docs/evidencias/traspaso_resultados.txt` |
| HU-07 Concurrencia del último artículo | #7 | 2 | Hecho | `V-CONC-A` confirmada y `V-CONC-B` rechazada en `docs/evidencias/resumen_evidencias.md` |
| HU-08 Tipo de cambio Banxico | #8 | 3 | En progreso | Fallback sin token documentado; falta token real para la consulta exitosa |
| HU-09 Respaldo y recuperación PITR | #9 | 3 | Hecho | `docs/evidencias/pitr_resultados.txt` |
| HU-10 Reportes consolidados | #10 | 4 | Hecho | Vista `v_ventas_por_sucursal` y pantalla de reportes (capturas pendientes) |

## Tarjetas técnicas

| Tarjeta | Issue | Sprint | Estado | Evidencia |
|---|---|---|---|---|
| Particionamiento por sucursal | #11 | 3 | Hecho | Poda de particiones en `docs/evidencias/distribuida_resultados.txt` |
| Replicación streaming | #12 | 3 | Hecho | `pg_stat_replication` y fila replicada en la réplica |
| Consultas con `postgres_fdw` | #13 | 3 | Hecho | Foreign table `inventario_b_remoto` |
| 2PC con transacciones preparadas | #14 | 3 | Hecho | `pg_prepared_xacts` y `COMMIT PREPARED` en ambos nodos |
| EXPLAIN/índices y almacenamiento | #15 | 3 | Hecho | `docs/evidencias/explain_resultados.txt` y `almacenamiento_resultados.txt` |
| Capturas de pantalla | #16 | 4 | Pendiente de evidencia | Login, búsqueda, inventario, POS, reportes y concurrencia |
| Token de Banxico | #17 | 3 | Pendiente de evidencia | Registrar token y capturar respuesta con `fecha` y `valor` |
| Repositorio remoto y tablero | #18 | 4 | Hecho | Repo y Project públicos; commits publicados |

## Creación (referencia)

El tablero se creó con GitHub CLI y quedó público:

```powershell
gh repo create angelgael10/ferreteria-pos --public --source . --remote origin --push
gh project create --owner angelgael10 --title "Ferreteria POS - Sprints"
gh project edit 1 --owner angelgael10 --visibility PUBLIC
gh project link 1 --owner angelgael10 --repo angelgael10/ferreteria-pos
gh issue create --title "HU-01 Autenticacion por rol" --label "sprint-1,hu"
gh project item-add 1 --owner angelgael10 --url <url-del-issue>
```

Los estados se asignaron con `gh project item-edit` y el campo Status del proyecto.

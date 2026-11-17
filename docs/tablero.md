# Tablero de seguimiento (GitHub Projects)

Copiar estas columnas y tarjetas en GitHub Projects (vista Board). También sirve como respaldo si el tablero se muestra desde el repositorio.

## Columnas

1. **Backlog**
2. **En progreso**
3. **Hecho**
4. **Pendiente de evidencia**

## Tarjetas por historia de usuario

| Tarjeta | Sprint | Estado | Evidencia |
|---|---|---|---|
| HU-01 Autenticación por rol | 1 | Hecho | Login y rutas por rol en `app/backend/src/routes/auth.js` y frontend |
| HU-02 Catálogo de productos | 1 | Hecho | Tablas de producto con herencia y API `/api/productos` |
| HU-03 Existencias por sucursal | 1 | Hecho | Vista `v_existencias_sucursal` e inventario en el frontend |
| HU-04 Punto de venta con carrito | 2 | Hecho | POS y función `registrar_venta` |
| HU-05 Búsqueda en vivo | 2 | Hecho | Búsqueda en el frontend + API de productos |
| HU-06 Traspasos entre sucursales | 2 | Hecho | `T-DEMO-01` (20→18 y 12→14) en `docs/evidencias/traspaso_resultados.txt` |
| HU-07 Concurrencia del último artículo | 2 | Hecho | `V-CONC-A` confirmada y `V-CONC-B` rechazada en `docs/evidencias/resumen_evidencias.md` |
| HU-08 Tipo de cambio Banxico | 3 | En progreso | Fallback sin token documentado; falta token real para la consulta exitosa |
| HU-09 Respaldo y recuperación PITR | 3 | Hecho | `docs/evidencias/pitr_resultados.txt` |
| HU-10 Reportes consolidados | 4 | Hecho | Vista `v_ventas_por_sucursal` y pantalla de reportes (capturas pendientes) |

## Tarjetas técnicas

| Tarjeta | Sprint | Estado | Evidencia |
|---|---|---|---|
| Particionamiento por sucursal | 3 | Hecho | Poda de particiones en `docs/evidencias/distribuida_resultados.txt` |
| Replicación streaming | 3 | Hecho | `pg_stat_replication` y fila replicada en la réplica |
| Consultas con `postgres_fdw` | 3 | Hecho | Foreign table `inventario_b_remoto` |
| 2PC con transacciones preparadas | 3 | Hecho | `pg_prepared_xacts` y `COMMIT PREPARED` en ambos nodos |
| EXPLAIN/índices y almacenamiento | 3 | Hecho | `docs/evidencias/explain_resultados.txt` y `almacenamiento_resultados.txt` |
| Capturas de pantalla | 4 | Pendiente de evidencia | Login, búsqueda, inventario, POS, reportes y concurrencia |
| Token de Banxico | 3 | Pendiente de evidencia | Registrar token y capturar respuesta con `fecha` y `valor` |
| Repositorio remoto y tablero | 4 | En progreso | Crear repo `angelgael10/ferreteria-pos` y publicar commits |

## Cómo crearlo en GitHub (web)

1. Entrar a GitHub → **Projects** → **New project** → plantilla **Board**.
2. Nombre: `Ferretería POS - Sprints`.
3. Crear las columnas Backlog, En progreso, Hecho y Pendiente de evidencia.
4. Crear un issue por cada HU con etiquetas `sprint-1`…`sprint-4` y `hu`.
5. Agregar los issues al proyecto y moverlos a la columna correspondiente.
6. Vincular el proyecto al repositorio `angelgael10/ferreteria-pos`.

## Cómo crearlo con GitHub CLI (después de autenticar)

```powershell
gh repo create angelgael10/ferreteria-pos --public --source . --remote origin --push
gh issue create --title "HU-01 Autenticación por rol" --body "Ver docs/backlog.md" --label "sprint-1,hu"
gh issue create --title "HU-02 Catálogo de productos" --body "Ver docs/backlog.md" --label "sprint-1,hu"
gh issue create --title "HU-03 Existencias por sucursal" --body "Ver docs/backlog.md" --label "sprint-1,hu"
gh issue create --title "HU-04 Punto de venta con carrito" --body "Ver docs/backlog.md" --label "sprint-2,hu"
gh issue create --title "HU-05 Búsqueda en vivo" --body "Ver docs/backlog.md" --label "sprint-2,hu"
gh issue create --title "HU-06 Traspasos entre sucursales" --body "Ver docs/backlog.md" --label "sprint-2,hu"
gh issue create --title "HU-07 Concurrencia del último artículo" --body "Ver docs/backlog.md" --label "sprint-2,hu"
gh issue create --title "HU-08 Tipo de cambio Banxico" --body "Ver docs/backlog.md" --label "sprint-3,hu"
gh issue create --title "HU-09 Respaldo y recuperación PITR" --body "Ver docs/backlog.md" --label "sprint-3,hu"
gh issue create --title "HU-10 Reportes consolidados" --body "Ver docs/backlog.md" --label "sprint-4,hu"
```

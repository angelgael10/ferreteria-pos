# Guion de demostración en vivo

La defensa considera 20 minutos de exposición más 5 minutos por cada materia adicional, seguidos de preguntas y de un cambio en vivo de aproximadamente 10 minutos. Este guion cubre los seis pasos que pide la rúbrica para P2 y deja una ruta de respaldo si falla la red.

## 1. Reparto de tiempo sugerido

| Bloque | Minutos | Apoyo |
|---|---:|---|
| Problema, objetivo y arquitectura | 3 | Slides 1-3 |
| Scrum y evidencias por unidad | 6 | Slides 4-10 |
| Demostración en vivo | 6 | Slide 11 y este guion |
| Resultados y cierre | 3 | Slides 12-14 |
| Preguntas del jurado | 15 | Documento y repositorio |
| Cambio en vivo | 10 | Slide 13 |

## 2. Paso 1: login y roles

1. Abrir `http://localhost:5173`.
2. Entrar con `gerente.cancun@ferreteria.local / hash_demo_gerente`.
3. Mostrar que el encabezado trae el nombre real desde `GET /api/auth/me`.
4. Salir y entrar con `cajero1.cancun@ferreteria.local / hash_demo_cajero`.
5. Intentar abrir Reportes: debe responder 403 y el botón debe estar oculto.

Evidencia: capturas 01 y 08; `docs/evidencias/api_externa_resultados.txt`.

## 3. Paso 2: búsqueda en vivo

1. En Productos escribir `martillo`.
2. Mostrar que la tabla se filtra sin recargar.
3. Cambiar la sucursal activa y repetir en Inventario para mostrar stock por sucursal.

Evidencia: capturas 02, 03 y 05.

## 4. Paso 3: venta con stock y bitácora

1. En Punto de venta buscar `martillo`.
2. Agregar una unidad al carrito y cobrar.
3. Mostrar el mensaje de éxito.
4. En `psql` ejecutar:

```sql
SELECT id_sucursal, sku, stock
FROM existencia
WHERE id_sucursal = 1 AND sku = 'HER-001';

SELECT id_bitacora, accion, detalle
FROM bitacora
ORDER BY id_bitacora DESC
LIMIT 2;
```

Resultado esperado: stock menor en una unidad y evento nuevo en bitácora.

## 5. Paso 4: API externa y casos de error

1. Entrar a Reportes con gerente o administrador.
2. Mostrar el tipo de cambio de Banxico: serie SF43718, fecha y valor USD/MXN.
3. Explicar que el token viaja en el header `Bmx-Token` desde el backend, nunca desde el navegador.
4. Si el token es inválido, el backend responde 400 controlado; si falla la red, responde 503 por el timeout de 8 segundos.

Evidencia: capturas 09 y 10; `docs/evidencias/api_externa_resultados.txt`.

## 6. Paso 5: concurrencia

Preparación:

```sql
UPDATE existencia SET stock = 1 WHERE id_sucursal = 1 AND sku = 'HER-001';
```

Sesión A:

```sql
BEGIN;
SELECT registrar_venta(1, 1, 1);
```

Sesión B, iniciada antes de confirmar A:

```sql
BEGIN;
SELECT registrar_venta(1, 1, 1);
```

Confirmar A:

```sql
COMMIT;
```

Resultado esperado: A confirma, B espera con `wait_event = transactionid` y falla por stock insuficiente; el stock final queda en 0.

Evidencia: `docs/evidencias/live_concurrencia_lock.txt`, `live_concurrencia_a.txt`, `live_concurrencia_b.txt`, `live_concurrencia_final.txt` y captura 13.

## 7. Paso 6: base de datos en vivo

1. Mostrar `SELECT current_setting('server_version');` → PostgreSQL 18.6.
2. Mostrar la vista de existencias por sucursal.
3. Ejecutar un `EXPLAIN` de búsqueda y explicar por qué `ILIKE '%texto%'` usa Seq Scan con herencia.
4. Si preguntan por distribución, abrir `docs/evidencias/distribuida_resultados.txt`.

## 8. Cambio en vivo

Elegir una de estas opciones y explicar cada línea mientras se cambia:

1. Añadir un campo nuevo al formulario de productos y enviarlo en `etiquetas`.
2. Cambiar una regla de rol para que el cajero pueda ver solo su sucursal.
3. Reordenar una consulta y volver a leer su plan de ejecución.

La opción 1 es la más segura: toca `Productos`, `form` y `POST /productos`; se verifica con la tabla y con `npm run build`.

## 9. Respuestas cortas para limitaciones conocidas

- **Auth demo:** las claves son hashes de prueba y el token es HMAC; en producción se usaría bcrypt y JWT/HTTPS.
- **Bitácora duplicada:** trigger y función pueden escribir el mismo evento; está anotado como mejora.
- **ILIKE con comodín inicial:** no aprovecha btree; la mejora sería `pg_trgm` o búsqueda por prefijo.
- **FDW y 2PC:** `postgres_fdw` no permite `PREPARE TRANSACTION` directo; se documentó la limitación y se comprobó Prepare/Commit en los nodos.
- **API externa:** Banxico se consulta con token en el header `Bmx-Token`; los errores 400/502/503 están controlados.

# Retrospectivas por sprint

## Sprint 1 – Planeación y base
- **Objetivo:** entorno Docker/PostgreSQL, repositorio, backlog, modelo relacional y base de app.
- **Qué se logró:** PostgreSQL 18 en Docker, esquema con herencia, tipo compuesto, arreglos y JSONB, scripts `01`-`06` aplicados y estructura inicial de backend/frontend.
- **Qué funcionó bien:** scripts SQL ordenados y comentados; datos demo de 3 sucursales, 8 usuarios y 6 productos.
- **Qué se puede mejorar:** las FKs hacia una tabla padre con `INHERITS` no funcionan como se esperaba; se quitaron y la integridad quedó validada por las funciones.
- **Acciones para el siguiente sprint:** implementar POS, traspasos y pruebas de concurrencia.

## Sprint 2 – Construcción
- **Objetivo:** POS, traspasos, funciones/triggers/transacciones, concurrencia, frontend dinámico.
- **Qué se logró:** POS con carrito, traspaso `T-DEMO-01` atómico, funciones/triggers/vistas y prueba de concurrencia con una venta confirmada (`V-CONC-A`) y otra rechazada.
- **Qué funcionó bien:** `SELECT ... FOR UPDATE` serializó el acceso al último artículo y el stock nunca quedó negativo; el frontend corrió sin errores.
- **Qué se puede mejorar:** el escapado de JSON en PowerShell provocó fallos; se resolvió usando archivos SQL. La bitácora duplica eventos por venta (trigger + función).
- **Acciones para el siguiente sprint:** ejecutar PITR, EXPLAIN, almacenamiento y la práctica de BD distribuida.

## Sprint 3 – Integración
- **Objetivo:** particionamiento, replicación, FDW, 2PC, PITR, API externa, EXPLAIN.
- **Qué se logró:** PITR real con `pg_basebackup` + WAL (solo filas 1 y 2), particionamiento con poda, réplica streaming, FDW A→B y 2PC con dos transacciones preparadas; Banxico responde aviso controlado sin token.
- **Qué funcionó bien:** las demostraciones en contenedores separados fueron reproducibles; la réplica mostró las filas del primario y `pg_prepared_xacts` evidenció el 2PC.
- **Qué se puede mejorar:** el índice btree no se usa con `ILIKE '%...%'` y herencia; `postgres_fdw` no admite `PREPARE TRANSACTION`; `recovery.signal` debe existir antes del primer arranque.
- **Acciones para el siguiente sprint:** capturas, token de Banxico, repositorio en GitHub y ensayo de la defensa.

## Sprint 4 – Cierre y defensa
- **Objetivo:** reportes, pruebas, documentación final, presentación y cambio en vivo.
- **Qué se logró:** reportes de ventas, manuales, `ESTUDIO_PROYECTO.md`, bitácora de IA con 8 entradas reales y evidencias guardadas en `docs/evidencias/`.
- **Qué funcionó bien:** cada evidencia se generó ejecutando el sistema y documentando también los errores y su corrección.
- **Qué se puede mejorar:** faltan capturas de pantalla y publicar el repositorio/tablero; conviene ensayar el cambio en vivo (por ejemplo, ajustar stock o crear una venta).
- **Lecciones aprendidas:** no documentar resultados sin ejecutarlos; los fallos (BOM, comillas de PowerShell, `recovery.signal`, límite de FDW) son parte válida del aprendizaje y de la bitácora.

# Product Backlog (HU y criterios de aceptación)

Roles: Administrador, Gerente de sucursal, Cajero. Registrar también en GitHub Projects.

## HU-01 Autenticación por rol (Sprint 1)
Como usuario, quiero iniciar sesión para acceder solo a lo que mi rol permite.
- **Dado** credenciales válidas, **cuando** inicio sesión, **entonces** accedo al sistema con las opciones de mi rol.
- **Dado** credenciales inválidas, **cuando** intento iniciar sesión, **entonces** veo un mensaje de error y no accedo.
- **Dado** que soy Cajero, **cuando** intento abrir reportes, **entonces** el acceso es denegado.

## HU-02 Catálogo de productos (Sprint 1)
Como administrador, quiero gestionar el catálogo para mantener actualizada la oferta.
- **Dado** datos válidos, **cuando** creo/edito un producto, **entonces** se guarda correctamente.
- **Dado** precio negativo o campos vacíos, **cuando** envío el formulario, **entonces** el sistema rechaza y muestra validación.
- **Dado** un producto, **cuando** lo clasifico, **entonces** es herramienta, material o eléctrico (herencia).

## HU-03 Existencias por sucursal (Sprint 1)
Como gerente, quiero ver existencias por sucursal para decidir reabastecimientos.
- **Dado** inventario registrado, **cuando** consulto, **entonces** veo producto, sucursal y cantidad.
- **Dado** el listado, **cuando** filtro por sucursal, **entonces** solo veo la sucursal seleccionada.

## HU-04 Punto de venta con carrito (Sprint 2)
Como cajero, quiero registrar una venta con carrito para cobrar al cliente.
- **Dado** stock suficiente, **cuando** confirmo la venta, **entonces** se descuenta el stock de mi sucursal y se registra la venta.
- **Dado** cantidad mayor al stock, **cuando** intento vender, **entonces** el sistema lo impide.
- **Dado** una venta confirmada, **cuando** se guarda, **entonces** queda registro en bitácora.

## HU-05 Búsqueda en vivo (Sprint 2)
Como cajero, quiero buscar productos en vivo para agilizar el cobro.
- **Dado** que escribo en el buscador, **cuando** ingreso nombre/código/etiqueta, **entonces** los resultados se actualizan sin recargar la página.

## HU-06 Traspasos entre sucursales (Sprint 2-3)
Como gerente, quiero traspasar mercancía con control para evitar pérdidas.
- **Dado** stock en origen, **cuando** confirmo el traspaso, **entonces** baja en origen y sube en destino.
- **Dado** un fallo en la operación, **cuando** se ejecuta, **entonces** no cambia en ninguno (atomicidad).
- **Dado** un traspaso, **cuando** se completa, **entonces** queda registrado.

## HU-07 Concurrencia/último artículo (Sprint 2)
Como negocio, quiero evitar la sobreventa del último artículo.
- **Dado** una sola existencia y dos ventas simultáneas, **cuando** ambas intentan confirmar, **entonces** una se confirma y la otra se rechaza.
- **Entonces** el stock nunca queda negativo.

## HU-08 Consulta a API externa (Sprint 3)
**Decisión final:** la historia se conservó con Banxico SIE. El backend consulta la serie SF43718 con token `Bmx-Token` y muestra el dato oportuno en Reportes. Issue #8 cerrado con ese criterio.

Como gerente, quiero consultar datos externos para apoyar la operación.
- **Dado** un token válido configurado, **cuando** abro Reportes, **entonces** veo el tipo de cambio USD/MXN con fecha y serie.
- **Dado** un token inválido, **cuando** consulto, **entonces** el sistema responde 400 con un aviso y no se cae.
- **Dado** que la API falla, **cuando** consulto, **entonces** se muestra un mensaje controlado (502/503).

## HU-09 Respaldo y recuperación PITR (Sprint 3)
Como administrador, quiero respaldar y recuperar la base ante fallos.
- **Dado** respaldo base y WAL archivados, **cuando** restauro a un punto en el tiempo, **entonces** la base queda en el estado solicitado.

## HU-10 Reportes consolidados (Sprint 4)
Como administrador, quiero reportes consolidados de todas las sucursales.
- **Dado** datos en las tres sucursales, **cuando** genero el reporte, **entonces** suma ventas y existencias de todas.

## Estado final
Las 10 historias y las 8 tareas técnicas quedaron en **Done** en GitHub Projects (18/18 issues cerrados). Evidencia de acceptance en `docs/evidencias/` y `docs/evidencias/capturas/`.

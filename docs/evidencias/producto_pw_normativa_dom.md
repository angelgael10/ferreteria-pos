# Normativa W3C, accesibilidad y diseño del DOM

Este documento reúne la evidencia solicitada por la unidad II de Programación Web. No afirma una certificación externa: describe qué criterios W3C/WCAG se aplicaron y dónde se pueden revisar en el código.

## 1. Normativa aplicada

| Requisito | Aplicación en el proyecto | Evidencia |
|---|---|---|
| HTML5 semántico | La interfaz usa `header`, `nav`, `main`, `section`, `form`, `table`, `caption` y `th scope="col"`. | `app/frontend/src/App.jsx` líneas 47, 125, 202-225, 380-387 y 716-739. |
| Idioma y codificación | `html lang="es"` y `meta charset="UTF-8"`; la base también usa `SET client_encoding = 'UTF8'`. | `app/frontend/index.html` líneas 3 y 5; `db/06_datos.sql`; `db/07_correcion_texto.sql`. |
| viewport y diseño adaptable | `meta viewport` y media queries para escritorio, tablet y móvil. | `app/frontend/index.html` línea 6; `app/frontend/src/diseno.css` líneas 911-1015. |
| Etiquetas asociadas a controles | Todos los campos usan `label htmlFor` con el `id` del control. | `app/frontend/src/App.jsx` líneas 101-105, 230, 323, 337-363, 575 y 694. |
| Navegación identificada | `nav` con `aria-label="Navegación principal"` y enlace de salto al contenido. | `app/frontend/src/App.jsx` líneas 125, 202 y 224. |
| Mensajes accesibles | Errores con `role="alert"`; resultado del tipo de cambio con `role="status"`; estados de stock con texto visible. | `app/frontend/src/App.jsx` línea 32 y bloque `Reportes` desde la línea 650. |
| Foco visible | Regla `button:focus-visible` para teclado. | `app/frontend/src/styles.css` línea 374. |
| Movimiento reducido | `@media (prefers-reduced-motion: reduce)` desactiva transiciones. | `app/frontend/src/styles.css` línea 806 y `app/frontend/src/diseno.css` línea 1011. |
| Tablas comprensibles | `caption`, `thead`, `th scope="col"` y celdas numéricas alineadas. | `app/frontend/src/App.jsx` líneas 380-387, 449-457, 609-616 y 716-739. |

## 2. Especificación del DOM

El árbol que React monta en `#root` queda organizado así:

```text
#root
└─ a.salto[href="#contenido"]
└─ main#contenido.contenedor
   ├─ header.encabezado
   │  ├─ .marca (icono, h1, subtitulo, folio)
   │  └─ .usuario-chip (nombre y rol)
   ├─ p.alerta[role="alert"] (solo cuando existe mensaje)
   ├─ nav.barra[aria-label="Navegación principal"]
   │  ├─ button.activo / button.sec
   │  └─ button.salir
   └─ section.card ...
      ├─ .card-header (eyebrow, h3, texto-ayuda)
      ├─ form / input / select / label
      ├─ table > caption + thead + tbody
       └─ .total-caja / .tipo-cambio
```

Las vistas no son páginas independientes: son secciones que React muestra u oculta según el estado `vista` (`productos`, `inventario`, `pos`, `reportes`). El `main#contenido` existe tanto en la pantalla de login como en la sesión iniciada, y el enlace `.salto` permite llegar a él con teclado.

## 3. Comportamiento dinámico

- `usuario`, `vista`, `sucursal`, `mensaje`, `q`, `carrito` y `tc` viven en `useState`.
- Un `useEffect` reconcilia la sesión con `GET /api/auth/me`.
- Otro `useEffect` carga `/sucursales` después del login.
- La búsqueda de productos usa un `useEffect` con retardo y llama a `/productos?q=...`.
- El stock por sucursal se recarga cuando cambia `sucursal`.
- El carrito calcula el total en el cliente y envía la venta al backend; el descuento real ocurre en PostgreSQL.

## 4. Verificación

- `npm run build` en `app/frontend` termina sin errores.
- `node --check` en los archivos JavaScript del backend termina sin errores.
- `npm test` en `app/backend` ejecuta 4 pruebas de token, roles y serie de Banxico; todas pasan.
- Las capturas 01, 03, 05, 07 y 11 documentan acentos reales en el selector de sucursales y el diseño en escritorio y móvil.
- Verificación de accesibilidad: `a.salto` recibe el foco y lleva a `#contenido`; `main#contenido` existe en login y en la sesión iniciada; `nav.barra` conserva `aria-label`, hay `th[scope="col"]` y la consola queda sin errores.
- Capturas relacionadas: `docs/evidencias/capturas/01-login.png`, `03-busqueda-en-vivo.png`, `05-inventario.png`, `07-pos-carrito.png` y `11-login-movil.png`.

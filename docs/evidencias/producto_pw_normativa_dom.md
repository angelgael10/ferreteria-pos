# Normativa W3C, accesibilidad y diseño del DOM

Este documento reúne la evidencia solicitada por la unidad II de Programación Web. No afirma una certificación externa: describe qué criterios W3C/WCAG se aplicaron y dónde se pueden revisar en el código.

## 1. Normativa aplicada

| Requisito | Aplicación en el proyecto | Evidencia |
|---|---|---|
| HTML5 semántico | La interfaz usa `header`, `nav`, `main`, `section`, `form`, `table`, `caption` y `th scope="col"`. | `app/frontend/src/App.jsx` líneas 40, 113, 182-204, 355-362 y 679-702. |
| Idioma y codificación | `html lang="es"` y `meta charset="UTF-8"`; la base también usa `SET client_encoding = 'UTF8'`. | `app/frontend/index.html` líneas 3 y 5; `db/06_datos.sql`; `db/07_correcion_texto.sql`. |
| viewport y diseño adaptable | `meta viewport` y media queries para escritorio, tablet y móvil. | `app/frontend/index.html` línea 6; `app/frontend/src/diseno.css` líneas 911-1015. |
| Etiquetas asociadas a controles | Todos los campos usan `label htmlFor` con el `id` del control. | `app/frontend/src/App.jsx` líneas 90-94, 209, 298, 312-338, 541 y 657. |
| Navegación identificada | `nav` con `aria-label="Navegación principal"` y enlace de salto al contenido. | `app/frontend/src/App.jsx` líneas 113, 182 y 203. |
| Mensajes accesibles | Errores con `role="alert"`; resultados de postal con `role="status"`; estados de stock con texto visible. | `app/frontend/src/App.jsx` líneas 29, 185, 206, 351, 418, 571, 661 y 663. |
| Foco visible | Regla `button:focus-visible` para teclado. | `app/frontend/src/styles.css` línea 374. |
| Movimiento reducido | `@media (prefers-reduced-motion: reduce)` desactiva transiciones. | `app/frontend/src/styles.css` línea 806 y `app/frontend/src/diseno.css` línea 1011. |
| Tablas comprensibles | `caption`, `thead`, `th scope="col"` y celdas numéricas alineadas. | `app/frontend/src/App.jsx` líneas 355-362, 422-430, 575-582 y 679-702. |

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
      └─ .total-caja / .postal-resultado
```

Las vistas no son páginas independientes: son secciones que React muestra u oculta según el estado `vista` (`productos`, `inventario`, `pos`, `reportes`). El `main#contenido` existe tanto en la pantalla de login como en la sesión iniciada, y el enlace `.salto` permite llegar a él con teclado.

## 3. Comportamiento dinámico

- `usuario`, `vista`, `sucursal`, `mensaje`, `q`, `carrito` y `cp` viven en `useState`.
- Un `useEffect` reconcilia la sesión con `GET /api/auth/me`.
- Otro `useEffect` carga `/sucursales` después del login.
- La búsqueda de productos usa un `useEffect` con retardo y llama a `/productos?q=...`.
- El stock por sucursal se recarga cuando cambia `sucursal`.
- El carrito calcula el total en el cliente y envía la venta al backend; el descuento real ocurre en PostgreSQL.

## 4. Verificación

- `npm run build` en `app/frontend` termina sin errores.
- `node --check` en los 11 archivos del backend termina sin errores.
- `npm test` en `app/backend` ejecuta 4 pruebas de token, roles y código postal; todas pasan.
- Selenium comprobó: acentos reales en el selector de sucursales, sin desbordes en 1440 px ni en 390 px, consola sin errores y estilos calculados de la paleta naranja/carbón y las tres fuentes.
- Verificación de accesibilidad: `a.salto` recibe el foco y lleva a `#contenido`; `main#contenido` existe en login y en la sesión iniciada; `nav.barra` conserva `aria-label`, hay `th[scope="col"]` y la consola queda sin errores.
- Capturas relacionadas: `docs/evidencias/capturas/01-login.png`, `03-busqueda-en-vivo.png`, `05-inventario.png`, `07-pos-carrito.png` y `11-login-movil.png`.

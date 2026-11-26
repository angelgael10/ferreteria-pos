# Reporte de componentes del framework e implementación MVC

Este documento reúne la evidencia solicitada por la unidad IV de Programación Web: componentes del framework seleccionado e implementación del patrón MVC.

## 1. Framework seleccionado

- **Frontend:** React 18.3.1 con Vite 5.4 y `@vitejs/plugin-react` (`app/frontend/package.json`).
- **Backend:** Node.js con Express 4.19.2 (`app/backend/package.json`).
- **Base de datos:** PostgreSQL 18.6 en Docker, accedida desde Node con `pg`.
- **Comunicación:** `fetch` desde `app/frontend/src/api.js` al prefijo `/api`, con proxy de Vite y token Bearer.

## 2. Componentes del framework

| Componente | Responsabilidad | Archivo |
|---|---|---|
| `App` | Estado global de sesión, vista, sucursal y mensajes; decide qué sección renderizar. | `app/frontend/src/App.jsx` línea 144 |
| `Encabezado` | Marca, título de la aplicación, sucursal activa y datos del usuario. | `app/frontend/src/App.jsx` línea 45 |
| `Login` | Formulario controlado, envío de credenciales y mensaje de error. | `app/frontend/src/App.jsx` línea 71 |
| `Nav` | Navegación por vistas, ocultación de reportes por rol y salida. | `app/frontend/src/App.jsx` línea 117 |
| `BadgeStock` | Estado visual de stock con texto: normal, bajo o agotado. | `app/frontend/src/App.jsx` línea 21 |
| `ErrorDatos` | Error de carga con botón de reintento. | `app/frontend/src/App.jsx` línea 32 |
| `Productos` | Catálogo, búsqueda en vivo y alta de productos. | `app/frontend/src/App.jsx` línea 252 |
| `Inventario` | Existencias filtradas por sucursal. | `app/frontend/src/App.jsx` línea 409 |
| `POS` | Búsqueda, carrito, cantidades, total y cobro. | `app/frontend/src/App.jsx` línea 480 |
| `Reportes` | Ventas consolidadas, stock total y consulta a Postali. | `app/frontend/src/App.jsx` línea 651 |

Los hooks utilizados son `useState` y `useEffect`. No se añadió una librería de estado externa porque el estado de esta interfaz es local a cada vista y se sincroniza con la API mediante `api(path, options)`.

## 3. Implementación del patrón MVC

| Capa | Implementación | Evidencia |
|---|---|---|
| Modelo | Tablas, vistas, funciones PL/pgSQL, triggers, reglas de stock y transacciones en PostgreSQL. Consultas parametrizadas desde `db/pool.js`. | `db/01_esquema.sql` a `db/07_correcion_texto.sql`; `app/backend/src/db/pool.js`. |
| Vista | Componentes React que renderizan formularios, tablas, mensajes y totales; estilos en `styles.css`, `diseno.css`, `colores.css` y `tipografia.css`. | `app/frontend/src/App.jsx`; capturas 01-08 y 11. |
| Controlador | Routers de Express que validan entradas, aplican roles y responden JSON. | `app/backend/src/routes/*.js`; `app/backend/src/middleware/auth.js`. |

### Flujo 1: búsqueda en vivo

1. El usuario escribe en `#buscar-productos`.
2. `Productos` actualiza `q` con `useState`.
3. Un `useEffect` espera el retardo y llama a `GET /productos?q=...`.
4. `routes/productos.js` consulta PostgreSQL con parámetros.
5. El JSON vuelve a React y se renderiza en la tabla con `caption` y `th scope="col"`.

Evidencia visual: `docs/evidencias/capturas/03-busqueda-en-vivo.png`.

### Flujo 2: venta

1. `POS` agrega artículos al carrito y calcula el total en el cliente.
2. `POST /ventas` envía `id_sucursal` y el arreglo de artículos.
3. `routes/ventas.js` valida los datos y llama a la función `registrar_venta` de PostgreSQL.
4. La función usa transacción y `SELECT ... FOR UPDATE`, descuenta stock y escribe bitácora.
5. La respuesta se muestra en `role="status"` y el carrito se limpia.

Evidencia: `docs/evidencias/capturas/07-pos-carrito.png`, `docs/evidencias/traspaso_resultados.txt` y `docs/evidencias/live_concurrencia_final.txt`.

## 4. Verificación

- `npm run build` compila el frontend sin errores.
- `node --check` pasa en los 11 archivos del backend.
- `npm test` pasa las 4 pruebas mínimas del backend en `app/backend/tests/auth.test.js`.
- `GET /api/health` responde 200 con PostgreSQL activo.
- Selenium verificó búsqueda, inventario, punto de venta, reportes, login móvil y consola sin errores.
- El código JavaScript de frontend y backend quedó comentado en español para explicar el propósito de cada componente, efecto, validación, transacción y respuesta.

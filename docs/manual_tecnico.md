# Manual técnico

## 1. Requisitos
- Docker Desktop, Node.js (v22+), npm, Git y navegador web. pgAdmin es opcional.

## 2. Instalación y configuración
1. Clonar o copiar el repositorio `ferreteria-pos`.
2. Copiar `.env.example` a `.env` en la raíz.
3. Copiar `app/backend/.env.example` a `app/backend/.env` y ajustar:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `SESSION_SECRET` (clave para firmar el token HMAC)
   - `BANXICO_TOKEN` (generado en `https://www.banxico.org.mx/SieAPIRest/service/v1/token`)
   - `BANXICO_SERIE` (por defecto `SF43718`)
4. Base de datos:
   ```bash
   docker compose up -d
   docker compose ps
   ```
   Los scripts `db/01`-`07` se montan en `/docker-entrypoint-initdb.d`; para repetirlos manualmente se ejecutan en orden con `psql`.
5. Backend:
   ```bash
   cd app/backend
   npm install
   npm run dev
   ```
6. Frontend:
   ```bash
   cd app/frontend
   npm install
   npm run dev
   ```
7. Verificación de producción del frontend: `npm run build` en `app/frontend`.
8. Pruebas mínimas del backend: `npm test` en `app/backend` (token HMAC, roles y serie de Banxico).

## 3. Arquitectura
Patrón API/MVC: React (vista) → Express (rutas/middlewares) → PostgreSQL (funciones PL/pgSQL y vistas). El proxy de Vite redirige `/api` al puerto 3001.

- `app/backend/src/middleware/auth.js`: firma y verifica tokens HMAC; `requiereRol(...)` protege rutas.
- `app/backend/src/routes/banxico.js`: consume Banxico SIE con `Bmx-Token` y normaliza errores 400/502/503.
- `app/backend/src/index.js`: monta rutas, middleware global de errores y 404.
- `app/frontend/src/api.js`: guarda la sesión en `sessionStorage` y añade `Authorization: Bearer <token>`.

## 4. Base de datos
- PostgreSQL 18 en Docker, host `localhost:5433`, base `ferreteria`.
- Tablas: sucursal, usuario, producto (con herencia a herramienta/material/eléctrico), inventario, venta, venta_detalle, traspaso, traspaso_detalle y bitacora.
- Funciones: `registrar_venta` y `registrar_traspaso`, con `SELECT ... FOR UPDATE` para evitar sobreventa.
- Vistas: `v_existencias_sucursal`, `v_existencias_consolidado` y `v_ventas_por_sucursal`.
- Los textos acentuados del seed usan literales `U&'...'` y `SET client_encoding = 'UTF8'`; `db/07_correcion_texto.sql` corrige una base ya inicializada.

## 5. Componentes del framework
- **Express:** enrutamiento, `express.json()`, CORS, middlewares de sesión/roles y manejo centralizado de errores.
- **React/Vite:** componentes funcionales, `useState`/`useEffect`, renderizado condicional por rol, carrito de venta, búsqueda en vivo y formularios controlados.
- **Accesibilidad:** encabezados jerárquicos, `label` asociados, `caption`/`scope` en tablas, foco visible y `prefers-reduced-motion`.

## 6. Operación y pruebas
- Salud: `GET /api/health`.
- Login: `POST /api/auth/login` devuelve `{ ok, usuario, token }`; `GET /api/auth/me` devuelve el usuario vigente desde la base de datos.
- Productos: `GET/POST/PUT /api/productos`; inventario: `GET /api/inventario?sucursal=`.
- Ventas y traspasos: `POST /api/ventas` y `POST /api/traspasos`.
- Reportes: `GET /api/reportes/ventas-sucursal` y `/existencias-consolidado` (administrador/gerente).
- Tipo de cambio: `GET /api/banxico/tipo-cambio`.
- Pruebas SQL y evidencias: `db/pruebas/` y `docs/evidencias/`.

## 7. Evidencias visuales
`docs/evidencias/capturas/` contiene 13 capturas reales: login, catálogo, búsqueda, formulario de producto, inventario, POS, carrito, reportes, API Banxico, vista móvil de Banxico, login móvil, repositorio y las dos sesiones de concurrencia.

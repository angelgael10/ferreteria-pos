# Manual técnico (borrador base)

## 1. Requisitos
- Docker Desktop, Node.js (v22+), npm, Git, navegador web, pgAdmin (opcional).

## 2. Instalación y configuración
1. Clonar/copiar el repositorio `ferreteria-pos`.
2. Configurar variables: copiar `.env.example` a `.env` (raíz) y ajustar credenciales.
3. Base de datos:
   - `docker compose up -d`
   - Ejecutar scripts en orden: `db/01_esquema.sql` a `db/06_datos.sql` (con `psql` o `docker exec`).
4. Backend:
   - `cd app/backend && copy .env.example .env` (ajustar DB_PASSWORD/puerto/DB)
   - `npm install` y `npm start` (API en `http://localhost:3001`).
5. Frontend:
   - `cd app/frontend && npm install && npm run dev` (UI en `http://localhost:5173`).

## 3. Arquitectura
- Ver `docs/arquitectura.md`. Patrón MVC/API: React (vista) -> Express (controladores/rutas) -> PostgreSQL (modelos/PLpgSQL).

## 4. Base de datos
- PostgreSQL 18 en Docker, puerto host 5433, BD `ferreteria`.
- Esquema: sucursal, usuario, producto (herencia), inventario, venta/venta_detalle, traspaso/traspaso_detalle, bitácora.
- Lógica: funciones `registrar_venta`, `registrar_traspaso`, triggers de bitácora, vistas de existencias/reportes.

## 5. Componentes del framework (a completar con evidencia)
- **Express:** enrutamiento, middlewares (cors, json), controladores en rutas.
- **React/Vite:** componentes, estado (`useState`), efectos (`useEffect`), renderizado dinámico/DOM, proxy dev.

## 6. Operación y pruebas
- Salud: `GET /api/health`. Pruebas de concurrencia/PITR/EXPLAIN: ver `db/pruebas/`.

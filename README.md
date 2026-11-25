# Sistema web de inventario y POS multisucursal para ferreterías

Proyecto integrador (Programación Web + Bases de Datos). Sucursales: Cancún, Playa del Carmen, Chetumal.

## Repositorio y tablero
- Repositorio: https://github.com/angelgael10/ferreteria-pos
- Tablero: https://github.com/users/angelgael10/projects/1
- Historial por sprint y 18 issues cerrados (18/18 en la columna Done).

## Stack
- **Base de datos:** PostgreSQL 18 en Docker
- **Backend:** Node.js + Express (API/MVC, sesión HMAC y roles)
- **Frontend:** React + Vite
- **API externa:** Postali (`https://postali.app`) para códigos postales de México, sin token
- **Contenedores:** Docker Compose

## Estructura
- `db/` scripts SQL (esquema, herencia, funciones, triggers, vistas, datos, pruebas)
- `app/backend/` API Express (`routes/`, `middleware/auth.js`)
- `app/frontend/` interfaz React
- `docs/` arquitectura, backlog, retrospectivas, bitácora IA, manuales y evidencias
- `docs/evidencias/capturas/` capturas reales del frontend y de la concurrencia
- `docs/entrega_word/` documento final PDF y material de apoyo
- `docs/presentacion/` presentación para defensa con marcadores de capturas en las notas

## Requisitos
- Docker Desktop
- Node.js y npm
- Git

## Inicio rápido
```bash
copy .env.example .env
copy app\backend\.env.example app\backend\.env
docker compose up -d
docker compose ps
docker exec ferreteria_db psql -U ferreteria -d ferreteria -c "SELECT version();"
```

PostgreSQL queda en `localhost:5433`, base y usuario `ferreteria`. El backend usa `DB_PASSWORD`, `SESSION_SECRET` y `POSTAL_API_BASE` (ver `.env.example`; no publicar `.env`).

## Ejecución de la aplicación
```bash
cd app/backend
npm install
npm run dev

cd app/frontend
npm install
npm run dev
```

Backend: `http://localhost:3001`. Frontend: `http://localhost:5173` (proxy `/api` al backend). `npm run build` verificado en el frontend.

## Usuarios demo
- `admin@ferreteria.local` / `hash_demo_admin` (administrador)
- `gerente.cancun@ferreteria.local` / `hash_demo_gerente` (gerente)
- `cajero1.cancun@ferreteria.local` / `hash_demo_cajero` (cajero)

El login devuelve un token HMAC con vigencia de 8 horas. Los reportes solo están disponibles para administrador y gerente.

## API externa
`GET /api/codigos-postales/:cp` consulta Postali y devuelve estado, municipio y asentamientos. Verificado con `77500` (Quintana Roo, Benito Juárez, 16 asentamientos), `99999` → 404 y `abc` → 400.

## Evidencias ejecutadas
- 2026-11-17: concurrencia del último artículo, `EXPLAIN`/índices/almacenamiento, traspaso atómico `T-DEMO-01`, PITR y BD distribuida (poda, réplica, FDW y 2PC).
- 2026-11-25: sesión con token y roles, alta/edición de producto, API de códigos postales, 13 capturas del frontend y repetición de la concurrencia con dos sesiones `V-CONC-LIVE-A`/`V-CONC-LIVE-B`.

Detalle en `docs/evidencias/resumen_evidencias.md`, `api_externa_resultados.txt`, `live_concurrencia_*.txt` y `capturas/`.

## Entregable
- Documento: [Trabajo_realizado_ferreteria_POS.pdf](docs/entrega_word/Trabajo_realizado_ferreteria_POS.pdf)
- Presentación: [Defensa_ferreteria_POS.pptx](docs/presentacion/Defensa_ferreteria_POS.pptx)
- Código y evidencias: este repositorio.

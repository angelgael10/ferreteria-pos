# Sistema web de inventario y POS multisucursal para ferreterías

Proyecto integrador (Programación Web + Bases de Datos). Sucursales: Cancún, Playa del Carmen, Chetumal.

## Stack
- **Base de datos:** PostgreSQL 18 en Docker
- **Backend:** Node.js + Express (API/MVC)
- **Frontend:** React + Vite
- **Contenedores:** Docker Compose

## Estructura
- `db/` scripts SQL (esquema, herencia, funciones, triggers, vistas, datos, pruebas)
- `app/backend/` API Express
- `app/frontend/` interfaz React
- `docs/` arquitectura, bitácora IA, retrospectivas y estudio

## Requisitos
- Docker Desktop
- Node.js y npm
- Git

## Inicio rápido (base de datos)
```bash
# Copiar variables de entorno
copy .env.example .env
# Levantar PostgreSQL
docker compose up -d
# Ver estado
docker compose ps
# Probar conexión
docker exec ferreteria_db psql -U ferreteria -d ferreteria -c "SELECT version();"
```

## Variables de entorno
Ver `.env.example`. El servicio expone PostgreSQL en `localhost:5433`, base `ferreteria`, usuario `ferreteria`.

## Ejecución de la aplicación
```bash
# Backend (puerto 3001)
cd app/backend
npm install
npm run dev

# Frontend (puerto 5173, proxy /api -> 3001)
cd app/frontend
npm install
npm run dev
```

## Evidencias ejecutadas (2026-11-17)
- Concurrencia del último artículo (venta confirmada vs rechazada, sin stock negativo).
- Planes `EXPLAIN`/índices y almacenamiento (páginas/TOAST).
- Traspaso atómico entre sucursales (`T-DEMO-01`).
- PITR real: respaldo base + WAL, restauración a un punto anterior (fila 3 no recuperada).
- BD distribuida: particionamiento con poda, réplica streaming, FDW y 2PC.

Detalle en `docs/evidencias/` y `docs/ESTUDIO_PROYECTO.md`.

## Pendientes para el entregable
- Capturas de pantalla del frontend y de las sesiones de concurrencia.
- Repositorio en GitHub con ramas/commits y tablero del proyecto.
- Token gratuito de Banxico en `app/backend/.env` para la consulta exitosa.

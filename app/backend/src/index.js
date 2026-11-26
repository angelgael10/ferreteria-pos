// index.js - punto de entrada del servidor Express (backend API MVC)
// Carga variables de entorno desde .env
require('dotenv').config(); // inicializa dotenv para leer configuración
const express = require('express'); // importa el framework Express para crear el servidor HTTP
const cors = require('cors'); // importa middleware CORS para permitir peticiones del frontend
const pool = require('./db/pool'); // importa el pool de conexión a PostgreSQL

// Importa los enrutadores (rutas) de cada módulo
const authRoutes = require('./routes/auth'); // rutas de autenticación
const productosRoutes = require('./routes/productos'); // rutas de catálogo de productos
const inventarioRoutes = require('./routes/inventario'); // rutas de inventario por sucursal
const ventasRoutes = require('./routes/ventas'); // rutas de punto de venta/ventas
const traspasosRoutes = require('./routes/traspasos'); // rutas de traspasos entre sucursales
const reportesRoutes = require('./routes/reportes'); // rutas de reportes
const banxicoRoutes = require('./routes/banxico'); // rutas para consultar el tipo de cambio de Banxico (API externa)
const sucursalesRoutes = require('./routes/sucursales'); // rutas para listar sucursales

const app = express(); // crea la aplicación Express
const PORT = process.env.PORT || 3001; // define el puerto del servidor (por defecto 3001)

// Middlewares globales
app.use(cors()); // habilita CORS para que el frontend (otro origen) pueda consumir la API
app.use(express.json()); // permite recibir y parsear cuerpos JSON en las peticiones

// Ruta simple de salud para verificar que la API y la BD responden
app.get('/api/health', async (req, res) => { // define endpoint GET /api/health
  try { // intenta consultar la base de datos
    const r = await pool.query('SELECT NOW() as ahora'); // ejecuta una consulta sencilla
    res.json({ ok: true, db: r.rows[0].ahora }); // responde con estado OK y hora de la BD
  } catch (err) { // si ocurre un error de conexión o consulta
    res.status(500).json({ ok: false, error: err.message }); // responde con error
  } // fin del manejo de error
}); // fin de la ruta /api/health

// Monta los enrutadores bajo prefijos /api/*
app.use('/api/auth', authRoutes); // monta rutas de autenticación
app.use('/api/productos', productosRoutes); // monta rutas de productos
app.use('/api/inventario', inventarioRoutes); // monta rutas de inventario
app.use('/api/ventas', ventasRoutes); // monta rutas de ventas
app.use('/api/traspasos', traspasosRoutes); // monta rutas de traspasos
app.use('/api/reportes', reportesRoutes); // monta rutas de reportes
app.use('/api/banxico', banxicoRoutes); // monta rutas de Banxico
app.use('/api/sucursales', sucursalesRoutes); // monta rutas de sucursales

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.message);
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Error interno del servidor' });
});

// Middleware básico de manejo de rutas no encontradas
app.use((req, res) => { // se ejecuta si ninguna ruta anterior coincidió
  res.status(404).json({ error: 'Ruta no encontrada' }); // responde 404 en formato JSON
}); // fin del middleware 404

// Inicia el servidor HTTP escuchando en el puerto configurado
app.listen(PORT, () => { // arranca el servidor
  console.log(`API escuchando en http://localhost:${PORT}`); // muestra mensaje en consola
}); // fin de app.listen

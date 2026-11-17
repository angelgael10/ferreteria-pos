// routes/sucursales.js - ruta para listar sucursales
const express = require('express'); // importa Express
const router = express.Router(); // crea el router
const pool = require('../db/pool'); // importa el pool de PostgreSQL

// GET /api/sucursales - devuelve la lista de sucursales activas
router.get('/', async (req, res) => { // define ruta GET
  try { // intenta consultar
    const r = await pool.query('SELECT id_sucursal, nombre, ciudad FROM sucursal WHERE activo = TRUE ORDER BY id_sucursal'); // consulta sucursales
    res.json(r.rows); // responde con el listado
  } catch (err) { // captura errores
    res.status(500).json({ error: err.message }); // responde error interno
  } // fin try/catch
}); // fin GET

module.exports = router; // exporta el router

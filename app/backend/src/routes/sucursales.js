const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requiereRol } = require('../middleware/auth');

// Devuelve el catálogo de sucursales activas para cualquier usuario con sesión
router.get('/', requiereRol(), async (req, res, next) => {
  try {
    const r = await pool.query('SELECT id_sucursal, nombre, ciudad FROM sucursal WHERE activo = TRUE ORDER BY id_sucursal');
    res.json(r.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

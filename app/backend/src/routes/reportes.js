const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requiereRol } = require('../middleware/auth');

// Reporte de ventas agrupadas por sucursal, restringido a administradores y gerentes
router.get('/ventas-sucursal', requiereRol('administrador', 'gerente'), async (req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM v_ventas_por_sucursal ORDER BY id_sucursal');
    res.json(r.rows);
  } catch (err) {
    next(err);
  }
});

// Reporte de existencias consolidadas de todos los productos
router.get('/existencias-consolidado', requiereRol('administrador', 'gerente'), async (req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM v_existencias_consolidado ORDER BY producto');
    res.json(r.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

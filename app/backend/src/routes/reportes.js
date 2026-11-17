// routes/reportes.js - rutas para reportes consolidados
const express = require('express'); // importa Express
const router = express.Router(); // crea el router
const pool = require('../db/pool'); // importa el pool de PostgreSQL

// GET /api/reportes/ventas-sucursal - resumen de ventas por sucursal
router.get('/ventas-sucursal', async (req, res) => { // define ruta de reporte de ventas
  try { // intenta consultar la vista
    const r = await pool.query('SELECT * FROM v_ventas_por_sucursal ORDER BY id_sucursal'); // consulta la vista
    res.json(r.rows); // devuelve resultados
  } catch (err) { // captura errores
    res.status(500).json({ error: err.message }); // responde error interno
  } // fin try/catch
}); // fin de ruta

// GET /api/reportes/existencias-consolidado - existencias totales por producto
router.get('/existencias-consolidado', async (req, res) => { // define ruta de consolidado
  try { // intenta consultar la vista
    const r = await pool.query('SELECT * FROM v_existencias_consolidado ORDER BY producto'); // consulta la vista
    res.json(r.rows); // devuelve resultados
  } catch (err) { // captura errores
    res.status(500).json({ error: err.message }); // responde error interno
  } // fin try/catch
}); // fin de ruta

module.exports = router; // exporta el router

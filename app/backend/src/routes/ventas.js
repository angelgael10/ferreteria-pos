// routes/ventas.js - rutas para registrar y consultar ventas (POS)
const express = require('express'); // importa Express
const router = express.Router(); // crea el router
const pool = require('../db/pool'); // importa el pool de PostgreSQL

// POST /api/ventas - registra una venta usando la función PL/pgSQL registrar_venta
router.post('/', async (req, res) => { // define ruta POST para crear venta
  const { folio, id_sucursal, id_usuario, items } = req.body || {}; // extrae datos de la venta
  // Valida campos obligatorios
  if (!folio || !id_sucursal || !id_usuario || !Array.isArray(items) || items.length === 0) { // verifica datos mínimos
    return res.status(400).json({ error: 'folio, id_sucursal, id_usuario e items son requeridos' }); // error de validación
  } // fin de validación
  try { // intenta registrar la venta
    // Llama a la función transaccional que descuenta stock con FOR UPDATE y registra bitácora
    const sql = 'SELECT registrar_venta($1, $2, $3, $4::jsonb) AS id_venta'; // consulta que invoca la función
    const r = await pool.query(sql, [folio, id_sucursal, id_usuario, JSON.stringify(items)]); // ejecuta con parámetros
    res.status(201).json({ ok: true, id_venta: r.rows[0].id_venta }); // responde con el id de la venta creada
  } catch (err) { // captura errores (ej. stock insuficiente)
    res.status(400).json({ error: err.message }); // responde el mensaje de error de la BD/validación
  } // fin try/catch
}); // fin POST /

module.exports = router; // exporta el router

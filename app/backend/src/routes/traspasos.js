// routes/traspasos.js - rutas para registrar traspasos entre sucursales
const express = require('express'); // importa Express
const router = express.Router(); // crea el router
const pool = require('../db/pool'); // importa el pool de PostgreSQL

// POST /api/traspasos - registra un traspaso usando la función PL/pgSQL registrar_traspaso
router.post('/', async (req, res) => { // define ruta POST para crear traspaso
  const { folio, sucursal_origen, sucursal_destino, id_usuario, items } = req.body || {}; // extrae datos
  // Valida campos obligatorios
  if (!folio || !sucursal_origen || !sucursal_destino || !id_usuario || !Array.isArray(items) || items.length === 0) { // verifica datos
    return res.status(400).json({ error: 'folio, sucursal_origen, sucursal_destino, id_usuario e items son requeridos' }); // error de validación
  } // fin de validación
  try { // intenta registrar el traspaso
    // Llama a la función transaccional atómica (descuenta origen y suma destino)
    const sql = 'SELECT registrar_traspaso($1, $2, $3, $4, $5::jsonb) AS id_traspaso'; // invoca la función
    const r = await pool.query(sql, [folio, sucursal_origen, sucursal_destino, id_usuario, JSON.stringify(items)]); // ejecuta
    res.status(201).json({ ok: true, id_traspaso: r.rows[0].id_traspaso }); // responde con el id creado
  } catch (err) { // captura errores (ej. stock insuficiente en origen)
    res.status(400).json({ error: err.message }); // responde el mensaje de error
  } // fin try/catch
}); // fin POST /

module.exports = router; // exporta el router

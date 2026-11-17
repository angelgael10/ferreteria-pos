// routes/inventario.js - rutas para consultar existencias por sucursal
const express = require('express'); // importa Express
const router = express.Router(); // crea el router
const pool = require('../db/pool'); // importa el pool de PostgreSQL

// GET /api/inventario - devuelve existencias; permite filtrar por id_sucursal
router.get('/', async (req, res) => { // define ruta GET de inventario
  const { sucursal } = req.query; // lee id de sucursal desde query string
  try { // intenta consultar la vista de existencias
    let sql = 'SELECT * FROM v_existencias_sucursal'; // consulta la vista creada en 05_vistas.sql
    const params = []; // arreglo de parámetros
    if (sucursal) { // si se especificó una sucursal
      params.push(Number(sucursal)); // agrega el id de sucursal como parámetro numérico
      sql += ' WHERE id_sucursal = $1'; // filtra por sucursal
    } // fin de filtro
    sql += ' ORDER BY sucursal, producto'; // ordena resultados
    const r = await pool.query(sql, params); // ejecuta la consulta
    res.json(r.rows); // devuelve las existencias
  } catch (err) { // captura errores
    res.status(500).json({ error: err.message }); // responde error interno
  } // fin try/catch
}); // fin GET /

module.exports = router; // exporta el router

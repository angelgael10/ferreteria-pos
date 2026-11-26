const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requiereRol } = require('../middleware/auth');

// Consulta la vista de existencias, opcionalmente filtrada por sucursal
router.get('/', requiereRol(), async (req, res, next) => {
  const { sucursal } = req.query;
  try {
    let sql = 'SELECT * FROM v_existencias_sucursal';
    const params = [];
    // Valida el filtro de sucursal y lo agrega a la consulta sólo si se envió
    if (sucursal !== undefined && sucursal !== '') {
      const id = Number(sucursal);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'La sucursal debe ser un identificador válido' });
      }
      params.push(id);
      sql += ' WHERE id_sucursal = $1';
    }
    sql += ' ORDER BY sucursal, producto';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requiereRol } = require('../middleware/auth');

// Registra una venta; sólo pueden operar administradores, gerentes y cajeros
router.post('/', requiereRol('administrador', 'gerente', 'cajero'), async (req, res, next) => {
  const { folio, id_sucursal, items } = req.body || {};
  // Validaciones de folio, sucursal y carrito antes de consultar la base de datos
  if (typeof folio !== 'string' || !folio.trim() || folio.length > 30) {
    return res.status(400).json({ error: 'El folio es requerido y debe tener máximo 30 caracteres' });
  }
  if (!Number.isInteger(Number(id_sucursal)) || Number(id_sucursal) <= 0) {
    return res.status(400).json({ error: 'La sucursal debe ser un identificador válido' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito debe contener al menos un producto' });
  }
  const ids = items.map((item) => Number(item.id_producto));
  if (ids.some((id) => !Number.isInteger(id) || id <= 0) || items.some((item) => !Number.isInteger(Number(item.cantidad)) || Number(item.cantidad) <= 0)) {
    return res.status(400).json({ error: 'Cada producto requiere un id y una cantidad mayor a cero' });
  }
  try {
    // Obtiene los precios vigentes para no confiar en los que envía el cliente
    const precios = await pool.query('SELECT id_producto, precio_mxn FROM producto WHERE id_producto = ANY($1::int[])', [ids]);
    const mapa = new Map(precios.rows.map((row) => [row.id_producto, Number(row.precio_mxn)]));
    const itemsSanitizados = items.map((item) => {
      const id = Number(item.id_producto);
      if (!mapa.has(id)) throw new Error(`Producto ${id} no existe`);
      return { id_producto: id, cantidad: Number(item.cantidad), precio_unitario: mapa.get(id) };
    });
    // Delega la inserción, existencias y detalle a la función de base de datos
    const sql = 'SELECT registrar_venta($1, $2, $3, $4::jsonb) AS id_venta';
    const r = await pool.query(sql, [folio.trim(), Number(id_sucursal), req.usuario.id_usuario, JSON.stringify(itemsSanitizados)]);
    res.status(201).json({ ok: true, id_venta: r.rows[0].id_venta });
  } catch (err) {
    // Errores de negocio (producto inexistente o stock) se devuelven como 400
    if (/no existe|Stock insuficiente/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;

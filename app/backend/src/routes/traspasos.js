const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requiereRol } = require('../middleware/auth');

// Registra un traspaso de inventario entre sucursales, sólo para administradores y gerentes
router.post('/', requiereRol('administrador', 'gerente'), async (req, res, next) => {
  const { folio, sucursal_origen, sucursal_destino, items } = req.body || {};
  // Valida folio, sucursales distintas y existencia de artículos en el carrito
  if (typeof folio !== 'string' || !folio.trim() || folio.length > 30) {
    return res.status(400).json({ error: 'El folio es requerido y debe tener máximo 30 caracteres' });
  }
  const origen = Number(sucursal_origen);
  const destino = Number(sucursal_destino);
  if (!Number.isInteger(origen) || !Number.isInteger(destino) || origen <= 0 || destino <= 0 || origen === destino) {
    return res.status(400).json({ error: 'Las sucursales de origen y destino deben ser distintas y válidas' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El traspaso debe contener al menos un producto' });
  }
  // Normaliza y valida cada producto antes de enviarlo a la base de datos
  const itemsSanitizados = items.map((item) => ({
    id_producto: Number(item.id_producto),
    cantidad: Number(item.cantidad),
  }));
  if (itemsSanitizados.some((item) => !Number.isInteger(item.id_producto) || item.id_producto <= 0 || !Number.isInteger(item.cantidad) || item.cantidad <= 0)) {
    return res.status(400).json({ error: 'Cada producto requiere un id y una cantidad mayor a cero' });
  }
  try {
    // La función registrar_traspaso valida stock y mueve las existencias entre sucursales
    const sql = 'SELECT registrar_traspaso($1, $2, $3, $4, $5::jsonb) AS id_traspaso';
    const r = await pool.query(sql, [folio.trim(), origen, destino, req.usuario.id_usuario, JSON.stringify(itemsSanitizados)]);
    res.status(201).json({ ok: true, id_traspaso: r.rows[0].id_traspaso });
  } catch (err) {
    // Devuelve como 400 los errores de negocio: stock, producto o sucursal inexistente
    if (/Stock insuficiente|no existe|origen/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;

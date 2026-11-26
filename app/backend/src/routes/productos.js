const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requiereRol } = require('../middleware/auth');

// Relación entre el tipo enviado por el cliente y la tabla hija donde se guarda
const TABLAS = {
  herramienta: 'producto_herramienta',
  material: 'producto_material',
  electrico: 'producto_electrico',
};

// Normaliza y valida los campos compartidos por todos los tipos de producto
function camposComunes(body) {
  const sku = typeof body.sku === 'string' ? body.sku.trim() : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const precio = Number(body.precio_mxn);
  if (!sku || sku.length > 40) throw new Error('El SKU es requerido y debe tener máximo 40 caracteres');
  if (!nombre || nombre.length > 150) throw new Error('El nombre es requerido y debe tener máximo 150 caracteres');
  if (!Number.isFinite(precio) || precio <= 0) throw new Error('El precio debe ser un número mayor a cero');
  const etiquetas = Array.isArray(body.etiquetas) ? body.etiquetas.filter((e) => typeof e === 'string' && e.trim()) : [];
  return {
    sku,
    nombre,
    descripcion: typeof body.descripcion === 'string' ? body.descripcion : null,
    precio_mxn: precio,
    unidad_medida: typeof body.unidad_medida === 'string' && body.unidad_medida.trim() ? body.unidad_medida.trim() : 'pieza',
    etiquetas,
    activo: body.activo !== false,
  };
}

// Lista los productos activos, con búsqueda opcional por nombre, SKU, etiquetas o códigos alternos
router.get('/', requiereRol(), async (req, res, next) => {
  const { q } = req.query;
  try {
    let sql = `SELECT p.id_producto, p.sku, p.nombre, p.descripcion, p.precio_mxn,
                      p.unidad_medida, p.etiquetas, p.codigos_alternos, p.especificaciones,
                      p.activo, tableoid::regclass AS tipo_tabla
               FROM producto p WHERE p.activo = TRUE`;
    const params = [];
    // Arma dinámicamente el filtro de búsqueda cuando llega el parámetro q
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (p.nombre ILIKE $1 OR p.sku ILIKE $1
                OR EXISTS (SELECT 1 FROM unnest(p.etiquetas) e WHERE e ILIKE $1)
                OR EXISTS (SELECT 1 FROM unnest(p.codigos_alternos) c WHERE c ILIKE $1))`;
    }
    sql += ' ORDER BY p.nombre LIMIT 100';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (err) {
    next(err);
  }
});

// Alta de producto: valida tipo y SKU único, y graba en la tabla hija correspondiente dentro de una transacción
router.post('/', requiereRol('administrador', 'gerente'), async (req, res, next) => {
  const client = await pool.connect();
  let enTransaccion = false;
  try {
    const datos = camposComunes(req.body || {});
    const tabla = TABLAS[req.body.tipo];
    if (!tabla) throw new Error('El tipo debe ser herramienta, material o eléctrico');
    // Evita registrar un SKU duplicado antes de iniciar la transacción
    const existe = await client.query('SELECT 1 FROM producto WHERE sku = $1', [datos.sku]);
    if (existe.rowCount) throw new Error(`El SKU ${datos.sku} ya está registrado`);
    await client.query('BEGIN');
    enTransaccion = true;
    const comunes = [datos.sku, datos.nombre, datos.descripcion, datos.precio_mxn, datos.unidad_medida, datos.etiquetas, datos.activo];
    let sql;
    let extra;
    // Cada tipo aporta campos propios, por eso se elige el INSERT según la tabla
    if (tabla === 'producto_herramienta') {
      sql = `INSERT INTO producto_herramienta
             (sku, nombre, descripcion, precio_mxn, unidad_medida, etiquetas, activo, material_mango, tipo_herramienta, uso)
             VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10) RETURNING id_producto`;
      extra = [req.body.material_mango || null, req.body.tipo_herramienta || null, req.body.uso || null];
    } else if (tabla === 'producto_material') {
      sql = `INSERT INTO producto_material
             (sku, nombre, descripcion, precio_mxn, unidad_medida, etiquetas, activo, tipo_material, presentacion, rendimiento)
             VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10) RETURNING id_producto`;
      extra = [req.body.tipo_material || null, req.body.presentacion || null, req.body.rendimiento || null];
    } else {
      sql = `INSERT INTO producto_electrico
             (sku, nombre, descripcion, precio_mxn, unidad_medida, etiquetas, activo, voltaje, consumo_watts, certificacion)
             VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10) RETURNING id_producto`;
      extra = [req.body.voltaje || null, Number(req.body.consumo_watts) || null, req.body.certificacion || null];
    }
    const r = await client.query(sql, [...comunes, ...extra]);
    await client.query('COMMIT');
    res.status(201).json({ ok: true, id_producto: r.rows[0].id_producto });
  } catch (err) {
    // Anula la transacción ante cualquier fallo y distingue errores de validación de los internos
    if (enTransaccion) await client.query('ROLLBACK');
    if (/SKU|precio|nombre|tipo debe/.test(err.message)) return res.status(400).json({ error: err.message });
    next(err);
  } finally {
    // Devuelve la conexión al grupo siempre, incluso si hubo error
    client.release();
  }
});

// Actualización transaccional de los datos comunes de un producto
router.put('/:id', requiereRol('administrador', 'gerente'), async (req, res, next) => {
  const client = await pool.connect();
  let enTransaccion = false;
  try {
    // Valida el identificador recibido en la URL antes de tocar la base de datos
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error('Identificador de producto inválido');
    const datos = camposComunes(req.body || {});
    await client.query('BEGIN');
    enTransaccion = true;
    const r = await client.query(
      `UPDATE producto SET sku=$1, nombre=$2, descripcion=$3, precio_mxn=$4,
       unidad_medida=$5, etiquetas=$6::text[], activo=$7 WHERE id_producto=$8`,
      [datos.sku, datos.nombre, datos.descripcion, datos.precio_mxn, datos.unidad_medida, datos.etiquetas, datos.activo, id],
    );
    if (!r.rowCount) throw new Error('Producto no encontrado');
    await client.query('COMMIT');
    res.json({ ok: true, id_producto: id });
  } catch (err) {
    // Deshace cambios parciales y reporta errores de validación o no encontrado como 400
    if (enTransaccion) await client.query('ROLLBACK');
    if (/SKU|precio|nombre|Producto no|Identificador/.test(err.message)) return res.status(400).json({ error: err.message });
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;

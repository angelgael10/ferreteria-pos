// routes/productos.js - rutas del catálogo de productos (CRUD básico)
const express = require('express'); // importa Express
const router = express.Router(); // crea el router
const pool = require('../db/pool'); // importa el pool de PostgreSQL

// GET /api/productos - lista productos con búsqueda opcional (nombre, sku, etiquetas)
router.get('/', async (req, res) => { // define ruta GET para listar/buscar productos
  const { q, sucursal } = req.query; // lee parámetros de búsqueda y filtro por sucursal
  try { // intenta ejecutar la consulta
    // Consulta base: productos con stock por sucursal (si se indica) o catálogo general
    let sql = `SELECT p.id_producto, p.sku, p.nombre, p.descripcion, p.precio_mxn,
                      p.unidad_medida, p.etiquetas, p.codigos_alternos, p.especificaciones,
                      p.activo, tableoid::regclass AS tipo_tabla
               FROM producto p WHERE p.activo = TRUE`; // selecciona productos activos e indica tabla hija/base
    const params = []; // arreglo de parámetros para la consulta preparada
    if (q) { // si se envió texto de búsqueda
      params.push(`%${q}%`); // agrega patrón de búsqueda como parámetro
      const i = params.length; // obtiene el índice del parámetro
      // Filtra por nombre, sku o pertenencia a etiquetas/códigos alternos
      sql += ` AND (p.nombre ILIKE $${i} OR p.sku ILIKE $${i}
                OR EXISTS (SELECT 1 FROM unnest(p.etiquetas) e WHERE e ILIKE $${i})
                OR EXISTS (SELECT 1 FROM unnest(p.codigos_alternos) c WHERE c ILIKE $${i}))`; // condición de búsqueda
    } // fin de condición de búsqueda
    sql += ' ORDER BY p.nombre LIMIT 100'; // ordena por nombre y limita resultados
    const r = await pool.query(sql, params); // ejecuta la consulta parametrizada
    res.json(r.rows); // devuelve la lista de productos en JSON
  } catch (err) { // captura errores
    res.status(500).json({ error: err.message }); // responde error interno
  } // fin try/catch
}); // fin GET /

module.exports = router; // exporta el router

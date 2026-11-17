// routes/auth.js - rutas de autenticación de usuarios
const express = require('express'); // importa Express para crear el router
const router = express.Router(); // crea una instancia de Router
const pool = require('../db/pool'); // importa el pool de conexión a la base de datos

// POST /api/auth/login - inicio de sesión básico por correo y contraseña (demo)
// Nota: en un sistema real la contraseña se compara con hash (bcrypt) y se usa JWT/sesión.
router.post('/login', async (req, res) => { // define la ruta POST /login
  const { correo, clave } = req.body || {}; // extrae correo y clave del cuerpo de la petición
  // Valida que se hayan enviado los campos requeridos
  if (!correo || !clave) { // si falta correo o clave
    return res.status(400).json({ error: 'Correo y clave son requeridos' }); // responde error de validación
  } // fin de validación de campos
  try { // intenta buscar al usuario en la base de datos
    // Busca usuario activo por correo (comparación simple para demo; en producción usar hash)
    const q = `SELECT id_usuario, nombre, correo, rol, id_sucursal
               FROM usuario WHERE correo = $1 AND clave_hash = $2 AND activo = TRUE`; // consulta parametrizada
    const r = await pool.query(q, [correo, clave]); // ejecuta la consulta con parámetros seguros
    if (r.rows.length === 0) { // si no se encontró usuario con esas credenciales
      return res.status(401).json({ error: 'Credenciales inválidas' }); // responde no autorizado
    } // fin de verificación de credenciales
    const user = r.rows[0]; // toma el usuario encontrado
    // Responde con los datos del usuario (en producción se devolvería un token)
    res.json({ ok: true, usuario: user }); // envía usuario autenticado al cliente
  } catch (err) { // captura errores de base de datos
    res.status(500).json({ error: err.message }); // responde error interno
  } // fin del try/catch
}); // fin de la ruta POST /login

module.exports = router; // exporta el router para montarlo en index.js

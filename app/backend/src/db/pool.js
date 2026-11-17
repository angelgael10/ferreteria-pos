// pool.js - crea y exporta un pool de conexiones a PostgreSQL usando pg
// Se carga dotenv para leer variables de entorno desde un archivo .env en desarrollo
require('dotenv').config(); // carga las variables definidas en .env al objeto process.env
const { Pool } = require('pg'); // importa la clase Pool del cliente de PostgreSQL para Node.js

// Crea una instancia de Pool con los parámetros de conexión tomados del entorno
const pool = new Pool({ // configura el pool de conexiones
  host: process.env.DB_HOST || 'localhost', // host donde corre PostgreSQL (contenedor expuesto)
  port: Number(process.env.DB_PORT || 5433), // puerto expuesto por Docker Compose (5433 -> 5432)
  database: process.env.DB_NAME || 'ferreteria', // nombre de la base de datos
  user: process.env.DB_USER || 'ferreteria', // usuario de la base de datos
  password: process.env.DB_PASSWORD || '', // contraseña del usuario (definida en .env)
}); // fin de la configuración del pool

// Exporta el pool para reutilizarlo en controladores y modelos
module.exports = pool; // permite hacer require('../db/pool') desde otros módulos

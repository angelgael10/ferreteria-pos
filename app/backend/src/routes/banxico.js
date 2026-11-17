// routes/banxico.js - ruta para consultar tipo de cambio USD/MXN desde API de Banxico (SIE)
// Requiere variable de entorno BANXICO_TOKEN; si falla o no hay token, responde con aviso sin caer.
const express = require('express'); // importa Express
const router = express.Router(); // crea el router

// GET /api/banxico/tipo-cambio - obtiene el tipo de cambio FIX (serie SF43718)
router.get('/tipo-cambio', async (req, res) => { // define la ruta GET
  const token = process.env.BANXICO_TOKEN; // lee el token de Banxico desde variables de entorno
  const serie = 'SF43718'; // serie del tipo de cambio FIX pesos por dólar (Banxico SIE)
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${serie}/datos/oportuno`; // URL del servicio
  // Si no hay token configurado, informa sin intentar la llamada
  if (!token) { // verifica que exista el token
    return res.json({ ok: false, aviso: 'BANXICO_TOKEN no configurado. Configura el token para consultar el tipo de cambio.' }); // aviso controlado
  } // fin de validación de token
  try { // intenta consumir la API externa
    // Realiza la petición HTTP a la API de Banxico con el token en el encabezado
    const resp = await fetch(url, { headers: { 'Bmx-Token': token, 'Accept': 'application/json' } }); // llama al servicio
    if (!resp.ok) { // si la respuesta HTTP no es exitosa
      throw new Error(`Banxico respondió ${resp.status}`); // lanza error con el código
    } // fin de verificación de estado
    const data = await resp.json(); // parsea la respuesta JSON
    const serieData = data?.bmx?.series?.[0]; // navega la estructura devuelta por Banxico
    const dato = serieData?.datos?.[0]; // toma el dato más reciente
    // Devuelve fecha y valor del tipo de cambio si existe
    res.json({ ok: true, serie, fecha: dato?.fecha, valor: dato?.dato }); // responde con el tipo de cambio
  } catch (err) { // captura errores de red o de la API
    // No se cae el sistema: responde con aviso y detalle del error
    res.json({ ok: false, aviso: 'No se pudo consultar la API de Banxico', detalle: err.message }); // respuesta controlada
  } // fin try/catch
}); // fin de la ruta

module.exports = router; // exporta el router

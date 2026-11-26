const express = require('express');
const router = express.Router();
const SERIE = process.env.BANXICO_SERIE || 'SF43718';

router.get('/tipo-cambio', async (req, res) => {
  const token = process.env.BANXICO_TOKEN;
  if (!token) return res.status(503).json({ ok: false, aviso: 'BANXICO_TOKEN no configurado.' });
  try {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${SERIE}/datos/oportuno`;
    const resp = await fetch(url, {
      headers: { 'Bmx-Token': token, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!resp.ok) {
      return res.status(resp.status === 400 ? 400 : 502).json({
        ok: false,
        aviso: 'Banxico rechazó la consulta',
        detalle: `HTTP ${resp.status}`
      });
    }
    const data = await resp.json();
    const dato = data?.bmx?.series?.[0]?.datos?.[0];
    if (!dato) return res.status(502).json({ ok: false, aviso: 'Banxico no devolvió datos para la serie' });
    res.json({ ok: true, serie: SERIE, fecha: dato.fecha, valor: dato.dato });
  } catch (err) {
    res.status(503).json({ ok: false, aviso: 'No se pudo consultar Banxico', detalle: err.message });
  }
});

module.exports = router;
module.exports.SERIE = SERIE;

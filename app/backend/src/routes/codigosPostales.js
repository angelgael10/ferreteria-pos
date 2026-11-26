const express = require('express');
const router = express.Router();
const BASE = (process.env.POSTAL_API_BASE || 'https://postali.app').replace(/\/$/, '');

function validarCP(cp) {
  return /^\d{5}$/.test(String(cp));
}

router.get('/:cp', async (req, res) => {
  const cp = req.params.cp;
  if (!validarCP(cp)) {
    return res.status(400).json({ ok: false, error: 'El código postal debe tener 5 dígitos' });
  }
  try {
    const resp = await fetch(`${BASE}/api/v1/mx/cp/${cp}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (resp.status === 404) {
      return res.status(404).json({ ok: false, error: 'Código postal no encontrado' });
    }
    if (!resp.ok) {
      return res.status(502).json({ ok: false, error: `Servicio externo respondió ${resp.status}` });
    }
    const data = await resp.json();
    const asentamientos = data.asentamientos || [];
    res.json({
      ok: true,
      cp: data.cp,
      estado: data.estado,
      municipio: data.municipio,
      total: asentamientos.length,
      asentamientos: asentamientos.slice(0, 8).map((a) => ({
        nombre: a.nombre,
        tipo: a.tipo,
        ciudad: a.ciudad,
        zona: a.zona,
      })),
    });
  } catch (err) {
    console.error('Error al consultar API de códigos postales:', err.message);
    res.status(503).json({ ok: false, error: 'No se pudo consultar el servicio de códigos postales' });
  }
});

module.exports = router;
module.exports.validarCP = validarCP;

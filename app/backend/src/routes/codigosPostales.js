const express = require('express');
const router = express.Router();
const BASE = (process.env.POSTAL_API_BASE || 'https://postali.app').replace(/\/$/, '');

// Valida que el código postal tenga exactamente cinco dígitos
function validarCP(cp) {
  return /^\d{5}$/.test(String(cp));
}

// Consulta un código postal en el servicio externo y devuelve sus asentamientos
router.get('/:cp', async (req, res) => {
  const cp = req.params.cp;
  // Rechaza códigos mal formados antes de llamar a la API
  if (!validarCP(cp)) {
    return res.status(400).json({ ok: false, error: 'El código postal debe tener 5 dígitos' });
  }
  try {
    // Petición con límite de tiempo para no bloquear la respuesta
    const resp = await fetch(`${BASE}/api/v1/mx/cp/${cp}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    // Distingue entre no encontrado y fallos del proveedor
    if (resp.status === 404) {
      return res.status(404).json({ ok: false, error: 'Código postal no encontrado' });
    }
    if (!resp.ok) {
      return res.status(502).json({ ok: false, error: `Servicio externo respondió ${resp.status}` });
    }
    const data = await resp.json();
    const asentamientos = data.asentamientos || [];
    // Limita la respuesta a los primeros ocho asentamientos
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
    // Errores de red o tiempo de espera se reportan como servicio no disponible
    console.error('Error al consultar API de códigos postales:', err.message);
    res.status(503).json({ ok: false, error: 'No se pudo consultar el servicio de códigos postales' });
  }
});

module.exports = router;
// Se expone también la validación para poder probarla de forma aislada
module.exports.validarCP = validarCP;

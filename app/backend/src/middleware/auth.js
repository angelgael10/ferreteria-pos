const crypto = require('crypto');
const SECRET = process.env.SESSION_SECRET || 'ferreteria-pos-demo-secret';
const TTL_MS = 8 * 60 * 60 * 1000;

function firmar(usuario) {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    rol: usuario.rol,
    id_sucursal: usuario.id_sucursal,
    iat: Date.now(),
  })).toString('base64url');
  const firma = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${firma}`;
}

function verificar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sesión requerida' });
  const partes = token.split('.');
  if (partes.length !== 2) return res.status(401).json({ error: 'Sesión inválida' });
  const esperada = crypto.createHmac('sha256', SECRET).update(partes[0]).digest('base64url');
  const recibida = Buffer.from(partes[1]);
  const calculada = Buffer.from(esperada);
  if (recibida.length !== calculada.length || !crypto.timingSafeEqual(recibida, calculada)) {
    return res.status(401).json({ error: 'Sesión inválida' });
  }
  let usuario;
  try {
    usuario = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8'));
  } catch {
    return res.status(401).json({ error: 'Sesión inválida' });
  }
  if (!usuario.iat || Date.now() - usuario.iat > TTL_MS) {
    return res.status(401).json({ error: 'Sesión expirada' });
  }
  req.usuario = usuario;
  next();
}

function requiereRol(...roles) {
  return (req, res, next) => verificar(req, res, () => {
    if (roles.length && !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso denegado para el rol ${req.usuario.rol}` });
    }
    next();
  });
}

module.exports = { firmar, verificar, requiereRol };

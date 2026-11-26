// Dependencias criptográficas y configuración de la sesión (secreto y vigencia de 8 horas)
const crypto = require('crypto');
const SECRET = process.env.SESSION_SECRET || 'ferreteria-pos-demo-secret';
const TTL_MS = 8 * 60 * 60 * 1000;

// Genera un token con los datos del usuario y su firma HMAC
function firmar(usuario) {
  const payload = Buffer.from(JSON.stringify({
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    rol: usuario.rol,
    id_sucursal: usuario.id_sucursal,
    iat: Date.now(),
  })).toString('base64url');
  // La firma protege el payload contra modificaciones
  const firma = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${firma}`;
}

// Verifica la sesión, expone el usuario en req y continúa con el siguiente middleware
function verificar(req, res, next) {
  // Extrae el token del encabezado Bearer
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sesión requerida' });
  // El token debe tener exactamente dos partes: payload y firma
  const partes = token.split('.');
  if (partes.length !== 2) return res.status(401).json({ error: 'Sesión inválida' });
  // Comparación en tiempo constante para evitar ataques de temporización
  const esperada = crypto.createHmac('sha256', SECRET).update(partes[0]).digest('base64url');
  const recibida = Buffer.from(partes[1]);
  const calculada = Buffer.from(esperada);
  if (recibida.length !== calculada.length || !crypto.timingSafeEqual(recibida, calculada)) {
    return res.status(401).json({ error: 'Sesión inválida' });
  }
  // Decodifica el payload; un JSON mal formado se rechaza
  let usuario;
  try {
    usuario = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8'));
  } catch {
    return res.status(401).json({ error: 'Sesión inválida' });
  }
  // Controla que la sesión no supere el tiempo de vida permitido
  if (!usuario.iat || Date.now() - usuario.iat > TTL_MS) {
    return res.status(401).json({ error: 'Sesión expirada' });
  }
  req.usuario = usuario;
  next();
}

// Exige una sesión válida y, si se indican roles, restringe el acceso a esos perfiles
function requiereRol(...roles) {
  return (req, res, next) => verificar(req, res, () => {
    if (roles.length && !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso denegado para el rol ${req.usuario.rol}` });
    }
    next();
  });
}

module.exports = { firmar, verificar, requiereRol };

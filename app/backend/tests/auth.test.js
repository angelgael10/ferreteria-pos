const test = require('node:test');
const assert = require('node:assert/strict');
const { firmar, verificar, requiereRol } = require('../src/middleware/auth');
const { SERIE } = require('../src/routes/banxico');

// Simula la respuesta de Express para capturar el código y el cuerpo enviados
function respuesta() {
  return {
    status(codigo) {
      this.codigo = codigo;
      return this;
    },
    json(cuerpo) {
      this.cuerpo = cuerpo;
      return this;
    },
  };
}

// Comprueba que un token recién firmado sea aceptado y expire en req.usuario
test('firmar y verificar aceptan un token valido', () => {
  const token = firmar({ id_usuario: 7, nombre: 'Gerente', rol: 'gerente', id_sucursal: 1 });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = respuesta();
  let siguiente = false;
  verificar(req, res, () => { siguiente = true; });
  assert.equal(siguiente, true);
  assert.equal(req.usuario.id_usuario, 7);
  assert.equal(req.usuario.rol, 'gerente');
});

// Un token manipulado debe rechazarse con 401 y no llamar al siguiente middleware
test('verificar rechaza un token alterado', () => {
  const token = firmar({ id_usuario: 7, nombre: 'Gerente', rol: 'gerente', id_sucursal: 1 });
  const alterado = `${token.slice(0, -1)}${token.at(-1) === 'a' ? 'b' : 'a'}`;
  const req = { headers: { authorization: `Bearer ${alterado}` } };
  const res = respuesta();
  let siguiente = false;
  verificar(req, res, () => { siguiente = true; });
  assert.equal(siguiente, false);
  assert.equal(res.codigo, 401);
});

// Verifica que requiereRol devuelva 403 para un perfil no autorizado
test('requiereRol bloquea un rol no autorizado', () => {
  const token = firmar({ id_usuario: 8, nombre: 'Cajero', rol: 'cajero', id_sucursal: 1 });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = respuesta();
  let siguiente = false;
  requiereRol('gerente')(req, res, () => { siguiente = true; });
  assert.equal(siguiente, false);
  assert.equal(res.codigo, 403);
});

test('la serie externa de Banxico es SF43718', () => {
  assert.equal(SERIE, 'SF43718');
});

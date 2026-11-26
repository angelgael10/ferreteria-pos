const test = require('node:test');
const assert = require('node:assert/strict');
const { firmar, verificar, requiereRol } = require('../src/middleware/auth');
const { validarCP } = require('../src/routes/codigosPostales');

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

test('requiereRol bloquea un rol no autorizado', () => {
  const token = firmar({ id_usuario: 8, nombre: 'Cajero', rol: 'cajero', id_sucursal: 1 });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = respuesta();
  let siguiente = false;
  requiereRol('gerente')(req, res, () => { siguiente = true; });
  assert.equal(siguiente, false);
  assert.equal(res.codigo, 403);
});

test('validarCP acepta solo cinco digitos', () => {
  assert.equal(validarCP('77500'), true);
  assert.equal(validarCP('99999'), true);
  assert.equal(validarCP('abc'), false);
  assert.equal(validarCP('7750'), false);
  assert.equal(validarCP('775000'), false);
});

SET client_encoding = 'UTF8';

UPDATE sucursal
SET nombre = CASE id_sucursal
  WHEN 1 THEN U&'Ferreter\00eda Canc\00fan Centro'
  WHEN 2 THEN U&'Ferreter\00eda Playa Centro'
  WHEN 3 THEN U&'Ferreter\00eda Chetumal Centro'
  ELSE nombre
END,
ciudad = CASE id_sucursal
  WHEN 1 THEN U&'Canc\00fan'
  WHEN 3 THEN 'Chetumal'
  ELSE ciudad
END,
direccion = CASE id_sucursal
  WHEN 3 THEN U&'Av. H\00e9roes 300, Centro'
  ELSE direccion
END
WHERE id_sucursal IN (1, 2, 3);

UPDATE usuario
SET nombre = CASE correo
  WHEN 'gerente.cancun@ferreteria.local' THEN U&'Gerente Canc\00fan'
  WHEN 'cajero1.cancun@ferreteria.local' THEN U&'Cajero Canc\00fan 1'
  WHEN 'cajero2.cancun@ferreteria.local' THEN U&'Cajero Canc\00fan 2'
END
WHERE correo IN (
  'gerente.cancun@ferreteria.local',
  'cajero1.cancun@ferreteria.local',
  'cajero2.cancun@ferreteria.local'
);

UPDATE producto
SET nombre = CASE sku
  WHEN 'HER-001' THEN U&'Martillo u\00f1a 16oz'
  WHEN 'MAT-002' THEN U&'Pintura vin\00edlica blanca 19L'
  WHEN 'ELE-002' THEN U&'Extensi\00f3n el\00e9ctrica 5m'
  ELSE nombre
END,
descripcion = CASE sku
  WHEN 'HER-001' THEN U&'Martillo de u\00f1a para carpinter\00eda'
  WHEN 'HER-002' THEN U&'Desarmador plano de precisi\00f3n'
  WHEN 'MAT-001' THEN U&'Cemento Portland gris para construcci\00f3n'
  WHEN 'MAT-002' THEN U&'Pintura vin\00edlica interior/exterior'
  WHEN 'ELE-001' THEN U&'Foco LED luz blanca ahorro de energ\00eda'
  WHEN 'ELE-002' THEN U&'Extensi\00f3n de uso rudo 3 contactos'
  ELSE descripcion
END
WHERE sku IN ('HER-001', 'HER-002', 'MAT-001', 'MAT-002', 'ELE-001', 'ELE-002');

UPDATE producto_herramienta
SET material_mango = U&'pl\00e1stico'
WHERE material_mango LIKE '%?%';

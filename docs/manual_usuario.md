# Manual de usuario (borrador base)

## Acceso
1. Abrir la aplicación web (frontend) en el navegador.
2. Iniciar sesión con correo y clave según rol (Administrador, Gerente, Cajero).

## Módulos
- **Productos:** búsqueda en vivo por nombre, SKU o etiqueta; visualización de catálogo y precios.
- **Inventario:** selección de sucursal y consulta de existencias (producto, stock, mínimo).
- **Punto de venta:** buscar productos, agregarlos al carrito, revisar total y confirmar venta; el sistema descuenta stock y registra la operación.
- **Reportes:** consulta de ventas por sucursal, existencias consolidadas y tipo de cambio USD/MXN (Banxico) con aviso si no está disponible.

## Mensajes comunes
- “Credenciales inválidas”: verificar correo/clave.
- “Stock insuficiente…”: no hay existencia disponible para la cantidad solicitada.
- Aviso Banxico: configurar token o reintentar si la API externa no responde.

> Completar con capturas de pantalla reales de tu ejecución.

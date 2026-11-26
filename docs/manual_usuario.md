# Manual de usuario

## Acceso
1. Abrir `http://localhost:5173` en el navegador.
2. Iniciar sesión con correo y clave del rol asignado.

| Rol | Usuario demo | Clave | Permisos |
|---|---|---|---|
| Administrador | `admin@ferreteria.local` | `hash_demo_admin` | Todo, incluido alta de productos |
| Gerente | `gerente.cancun@ferreteria.local` | `hash_demo_gerente` | Inventario, POS, reportes y alta de productos |
| Cajero | `cajero1.cancun@ferreteria.local` | `hash_demo_cajero` | Productos, inventario y POS; sin reportes |

La sesión se guarda solo en la pestaña del navegador (`sessionStorage`) y expira a las 8 horas. Para salir, usar **Salir** en la barra superior.

## Módulos
- **Productos:** búsqueda en vivo por nombre, SKU o etiqueta. Administrador y gerente pueden usar **Nuevo producto** para dar de alta herramientas, materiales o artículos eléctricos.
- **Inventario:** elegir sucursal y consultar producto, stock y mínimo. Si la consulta falla, se muestra un aviso en lugar de una tabla vacía.
- **Punto de venta:** buscar producto, agregarlo al carrito, ajustar cantidades, ver el total y confirmar. El botón se deshabilita mientras se procesa para evitar ventas duplicadas; si no hay stock aparece “Stock insuficiente…”.
- **Reportes:** resumen de ventas por sucursal, existencias consolidadas y tipo de cambio de Banxico. Solo disponible para administrador y gerente; el cajero recibe “Acceso denegado para el rol cajero”.
- **Tipo de cambio:** al abrir Reportes se consulta automáticamente la serie SF43718 de Banxico y se muestra el valor USD/MXN con su fecha. No hay formulario porque el token se configura en el backend.

## Mensajes comunes
- “Credenciales inválidas”: revisar correo y clave.
- “Stock insuficiente…”: no hay existencias para la cantidad solicitada.
- “No se pudo consultar Banxico”: revisar que el backend esté activo y que `BANXICO_TOKEN` esté configurado.
- “Banxico rechazó la consulta”: revisar el token o el límite de peticiones de la serie.
- “Acceso denegado para el rol cajero”: el módulo requiere administrador o gerente.
- “No se pudo conectar. Verifica que el backend esté activo”: levantar `npm run dev` en `app/backend`.

## Capturas
Ejemplos reales en `docs/evidencias/capturas/`: `01-login.png`, `03-busqueda-en-vivo.png`, `05-inventario.png`, `07-pos-carrito.png`, `08-reportes.png`, `09-api-banxico.png`, `10-api-banxico-movil.png`, `11-login-movil.png` y `13-concurrencia-sesiones.png`.

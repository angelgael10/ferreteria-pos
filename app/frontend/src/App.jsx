// App.jsx - componente principal: navegación simple entre módulos (login, productos, inventario, POS, reportes)
import { useEffect, useState } from 'react'; // importa hooks de estado y efecto de React
import { api } from './api.js'; // importa la función auxiliar para llamar a la API

// Componente principal de la aplicación
export default function App() { // define y exporta el componente App
  // Estados globales sencillos de la interfaz
  const [usuario, setUsuario] = useState(null); // almacena el usuario autenticado (o null)
  const [vista, setVista] = useState('login'); // controla qué vista/módulo se muestra
  const [sucursal, setSucursal] = useState('1'); // sucursal seleccionada (por defecto Cancún=1)
  const [mensaje, setMensaje] = useState(''); // mensaje informativo o de error

  // Maneja el cierre de sesión limpiando el usuario y regresando al login
  function salir() { // función para cerrar sesión
    setUsuario(null); // elimina el usuario autenticado
    setVista('login'); // regresa a la vista de login
    setMensaje(''); // limpia mensajes
  } // fin de salir

  // Renderiza la barra de navegación cuando hay usuario autenticado
  function Nav() { // componente interno de navegación
    return ( // devuelve la barra de botones
      <div className="barra"> {/* contenedor de botones de navegación */}
        <button className="sec" onClick={() => setVista('productos')}>Productos</button> {/* ir a productos */}
        <button className="sec" onClick={() => setVista('inventario')}>Inventario</button> {/* ir a inventario */}
        <button className="sec" onClick={() => setVista('pos')}>Punto de venta</button> {/* ir a POS */}
        <button className="sec" onClick={() => setVista('reportes')}>Reportes</button> {/* ir a reportes */}
        <button className="sec" onClick={salir}>Salir</button> {/* cerrar sesión */}
        <span>Usuario: {usuario?.nombre} ({usuario?.rol})</span> {/* muestra usuario actual */}
      </div> // fin barra
    ); // fin return Nav
  } // fin Nav

  // Renderiza la aplicación según el estado de autenticación y la vista seleccionada
  return ( // devuelve la interfaz completa
    <div className="contenedor"> {/* contenedor principal */}
      <h2>Ferretería POS multisucursal</h2> {/* título de la aplicación */}
      {mensaje && <p className="error">{mensaje}</p>} {/* muestra mensaje si existe */}
      {!usuario ? ( // si no hay usuario autenticado
        <Login onLogin={(u) => { setUsuario(u); setVista('productos'); }} setMensaje={setMensaje} /> // muestra login
      ) : ( // si hay usuario autenticado
        <>
          <Nav /> {/* muestra navegación */}
          <div className="card"> {/* selector de sucursal activo */}
            <label>Sucursal: </label> {/* etiqueta del selector */}
            <select value={sucursal} onChange={(e) => setSucursal(e.target.value)}> {/* selector de sucursal */}
              <option value="1">Cancún</option> {/* opción Cancún */}
              <option value="2">Playa del Carmen</option> {/* opción Playa */}
              <option value="3">Chetumal</option> {/* opción Chetumal */}
            </select> {/* fin select */}
          </div> {/* fin card sucursal */}
          {vista === 'productos' && <Productos />} {/* vista de productos/búsqueda */}
          {vista === 'inventario' && <Inventario sucursal={sucursal} />} {/* vista de inventario */}
          {vista === 'pos' && <POS sucursal={sucursal} usuario={usuario} />} {/* vista punto de venta */}
          {vista === 'reportes' && <Reportes />} {/* vista de reportes */}
        </> // fin fragmento autenticado
      )} {/* fin condicional autenticación */}
    </div> // fin contenedor
  ); // fin return App
} // fin componente App

// Componente de inicio de sesión (demo)
function Login({ onLogin, setMensaje }) { // recibe callback de login y setter de mensaje
  const [correo, setCorreo] = useState('cajero1.cancun@ferreteria.local'); // estado del correo
  const [clave, setClave] = useState('hash_demo_cajero'); // estado de la clave (demo)
  // Envía credenciales al backend para autenticar
  async function enviar(e) { // manejador del submit
    e.preventDefault(); // evita recarga de la página
    setMensaje(''); // limpia mensajes previos
    try { // intenta autenticar
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ correo, clave }) }); // POST login
      onLogin(data.usuario); // notifica usuario autenticado al componente padre
    } catch (err) { // si falla la autenticación
      setMensaje(err.message); // muestra el error
    } // fin try/catch
  } // fin enviar
  return ( // formulario de login
    <form className="card" onSubmit={enviar}> {/* tarjeta con formulario */}
      <h3>Iniciar sesión</h3> {/* subtítulo */}
      <div className="fila"> {/* fila de campos */}
        <div className="col"> {/* columna correo */}
          <label>Correo</label><br/> {/* etiqueta */}
          <input value={correo} onChange={(e) => setCorreo(e.target.value)} /> {/* input correo */}
        </div> {/* fin col */}
        <div className="col"> {/* columna clave */}
          <label>Clave</label><br/> {/* etiqueta */}
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} /> {/* input clave */}
        </div> {/* fin col */}
      </div> {/* fin fila */}
      <p><button type="submit">Entrar</button></p> {/* botón enviar */}
      <small>Demo: cajero1.cancun@ferreteria.local / hash_demo_cajero</small> {/* ayuda demo */}
    </form> // fin form
  ); // fin return
} // fin Login

// Componente de catálogo/búsqueda en vivo de productos
function Productos() { // lista y busca productos
  const [q, setQ] = useState(''); // texto de búsqueda
  const [items, setItems] = useState([]); // resultados de productos
  // Efecto: busca productos cuando cambia el texto (búsqueda en vivo sin recargar)
  useEffect(() => { // se ejecuta al montar y cuando cambia q
    const t = setTimeout(async () => { // espera breve para no disparar en cada tecla inmediatamente
      try { const data = await api('/productos?q=' + encodeURIComponent(q)); setItems(data); } catch { setItems([]); } // consulta API
    }, 250); // retardo de 250ms
    return () => clearTimeout(t); // limpia el temporizador al cambiar q
  }, [q]); // dependencia: q
  return ( // vista de productos
    <div className="card"> {/* tarjeta */}
      <h3>Catálogo de productos (búsqueda en vivo)</h3> {/* título */}
      <input placeholder="Buscar por nombre, SKU o etiqueta" value={q} onChange={(e) => setQ(e.target.value)} /> {/* input búsqueda */}
      <table> {/* tabla de resultados */}
        <thead><tr><th>SKU</th><th>Nombre</th><th>Precio MXN</th><th>Tipo</th><th>Etiquetas</th></tr></thead> {/* encabezados */}
        <tbody> {/* cuerpo de tabla */}
          {items.map(p => ( // recorre productos
            <tr key={p.id_producto}> {/* fila por producto */}
              <td>{p.sku}</td><td>{p.nombre}</td><td>${p.precio_mxn}</td><td>{p.tipo_tabla}</td><td>{(p.etiquetas||[]).join(', ')}</td> {/* celdas */}
            </tr> // fin fila
          ))} {/* fin map */}
        </tbody> {/* fin cuerpo */}
      </table> {/* fin tabla */}
    </div> // fin card
  ); // fin return
} // fin Productos

// Componente de inventario por sucursal
function Inventario({ sucursal }) { // recibe sucursal seleccionada
  const [items, setItems] = useState([]); // existencias
  // Carga inventario al montar y cuando cambia la sucursal
  useEffect(() => { // efecto de carga
    api('/inventario?sucursal=' + sucursal).then(setItems).catch(() => setItems([])); // consulta inventario
  }, [sucursal]); // dependencia sucursal
  return ( // vista inventario
    <div className="card"> {/* tarjeta */}
      <h3>Existencias por sucursal</h3> {/* título */}
      <table> {/* tabla */}
        <thead><tr><th>Sucursal</th><th>SKU</th><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead> {/* encabezados */}
        <tbody>{items.map((r,i)=>(<tr key={i}><td>{r.sucursal}</td><td>{r.sku}</td><td>{r.producto}</td><td>{r.stock}</td><td>{r.stock_minimo}</td></tr>))}</tbody> {/* filas */}
      </table> {/* fin tabla */}
    </div> // fin card
  ); // fin return
} // fin Inventario

// Componente de punto de venta con carrito
function POS({ sucursal, usuario }) { // recibe sucursal y usuario
  const [q, setQ] = useState(''); // búsqueda de producto
  const [productos, setProductos] = useState([]); // resultados de búsqueda
  const [carrito, setCarrito] = useState([]); // renglones del carrito
  const [msg, setMsg] = useState(''); // mensaje de resultado
  // Búsqueda en vivo de productos para agregar al carrito
  useEffect(() => { // efecto de búsqueda
    const t = setTimeout(async () => { // retardo
      try { setProductos(q ? await api('/productos?q=' + encodeURIComponent(q)) : []); } catch { setProductos([]); } // busca
    }, 250); // 250ms
    return () => clearTimeout(t); // limpia
  }, [q]); // depende de q
  // Agrega un producto al carrito (cantidad 1 por defecto)
  function agregar(p) { // función agregar
    setCarrito(c => { // actualiza carrito
      const ex = c.find(x => x.id_producto === p.id_producto); // busca si ya existe
      if (ex) return c.map(x => x.id_producto===p.id_producto ? { ...x, cantidad: x.cantidad + 1 } : x); // incrementa cantidad
      return [...c, { id_producto: p.id_producto, nombre: p.nombre, precio_unitario: Number(p.precio_mxn), cantidad: 1 }]; // agrega nuevo
    }); // fin setCarrito
  } // fin agregar
  // Calcula el total del carrito
  const total = carrito.reduce((s, r) => s + r.cantidad * r.precio_unitario, 0); // suma importes
  // Envía la venta al backend
  async function cobrar() { // función cobrar
    setMsg(''); // limpia mensaje
    try { // intenta registrar venta
      const folio = 'V-' + Date.now(); // genera folio simple basado en tiempo
      const items = carrito.map(r => ({ id_producto: r.id_producto, cantidad: r.cantidad, precio_unitario: r.precio_unitario })); // arma items
      const data = await api('/ventas', { method: 'POST', body: JSON.stringify({ folio, id_sucursal: Number(sucursal), id_usuario: usuario.id_usuario, items }) }); // POST venta
      setMsg('Venta registrada. ID: ' + data.id_venta); // mensaje de éxito
      setCarrito([]); // vacía carrito
    } catch (err) { // si falla (ej. stock insuficiente)
      setMsg('Error: ' + err.message); // muestra error
    } // fin try/catch
  } // fin cobrar
  return ( // vista POS
    <div className="fila"> {/* dos columnas */}
      <div className="col card"> {/* columna búsqueda */}
        <h3>Buscar producto</h3> {/* título */}
        <input placeholder="Nombre, SKU o etiqueta" value={q} onChange={(e) => setQ(e.target.value)} /> {/* input búsqueda */}
        <ul> {/* lista de resultados */}
          {productos.map(p => (<li key={p.id_producto}>{p.nombre} (${p.precio_mxn}) <button onClick={() => agregar(p)}>Agregar</button></li>))} {/* items */}
        </ul> {/* fin lista */}
      </div> {/* fin col */}
      <div className="col card"> {/* columna carrito */}
        <h3>Carrito</h3> {/* título */}
        <table> {/* tabla carrito */}
          <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead> {/* encabezados */}
          <tbody>{carrito.map(r => (<tr key={r.id_producto}><td>{r.nombre}</td><td>{r.cantidad}</td><td>${r.precio_unitario}</td><td>${(r.cantidad*r.precio_unitario).toFixed(2)}</td></tr>))}</tbody> {/* filas */}
        </table> {/* fin tabla */}
        <p><strong>Total: ${total.toFixed(2)}</strong></p> {/* total */}
        <button onClick={cobrar} disabled={!carrito.length}>Confirmar venta</button> {/* botón cobrar */}
        {msg && <p>{msg}</p>} {/* mensaje resultado */}
      </div> {/* fin col */}
    </div> // fin fila
  ); // fin return
} // fin POS

// Componente de reportes y tipo de cambio
function Reportes() { // muestra reportes consolidados y tipo de cambio
  const [ventas, setVentas] = useState([]); // ventas por sucursal
  const [existencias, setExistencias] = useState([]); // existencias consolidadas
  const [tc, setTc] = useState(null); // tipo de cambio
  // Carga reportes y tipo de cambio al montar
  useEffect(() => { // efecto inicial
    api('/reportes/ventas-sucursal').then(setVentas).catch(()=>setVentas([])); // carga ventas
    api('/reportes/existencias-consolidado').then(setExistencias).catch(()=>setExistencias([])); // carga existencias
    api('/banxico/tipo-cambio').then(setTc).catch(()=>setTc({ok:false,aviso:'Error al consultar'})); // carga tipo de cambio
  }, []); // solo al montar
  return ( // vista reportes
    <div className="card"> {/* tarjeta */}
      <h3>Reportes</h3> {/* título */}
      <h4>Tipo de cambio (Banxico)</h4> {/* subtítulo */}
      {tc && (tc.ok ? <p className="ok">USD/MXN: {tc.valor} ({tc.fecha})</p> : <p className="error">{tc.aviso || 'No disponible'} {tc.detalle || ''}</p>)} {/* muestra tipo de cambio o aviso */}
      <h4>Ventas por sucursal</h4> {/* subtítulo */}
      <table><thead><tr><th>Sucursal</th><th># Ventas</th><th>Total vendido</th></tr></thead><tbody>{ventas.map(v=>(<tr key={v.id_sucursal}><td>{v.sucursal}</td><td>{v.numero_ventas}</td><td>${v.total_vendido}</td></tr>))}</tbody></table> {/* tabla ventas */}
      <h4>Existencias consolidadas</h4> {/* subtítulo */}
      <table><thead><tr><th>SKU</th><th>Producto</th><th>Stock total</th></tr></thead><tbody>{existencias.map(e=>(<tr key={e.id_producto}><td>{e.sku}</td><td>{e.producto}</td><td>{e.stock_total}</td></tr>))}</tbody></table> {/* tabla existencias */}
    </div> // fin card
  ); // fin return
} // fin Reportes

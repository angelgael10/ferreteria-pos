import { useEffect, useState } from "react";
import { api, guardarSesion, leerSesion, limpiarSesion } from "./api.js";

const NOMBRES_SUCURSAL = { 1: "Cancún", 2: "Playa del Carmen", 3: "Chetumal" };
const ROLES_CON_REPORTES = ["administrador", "gerente"];
const formatoMXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
}).format;

function BadgeStock({ stock, minimo }) {
  const cantidad = Number(stock);
  const minimoNumero = Number(minimo);
  const agotado = cantidad <= 0;
  const bajo = !agotado && cantidad <= minimoNumero;
  const clase = agotado ? "badge-agotado" : bajo ? "badge-bajo" : "badge-ok";
  const texto = agotado ? "Agotado" : bajo ? "Stock bajo" : "Disponible";
  return <span className={`badge ${clase}`}>{texto}</span>;
}

function ErrorDatos({ error, onReintentar }) {
  if (!error) return null;
  return (
    <div className="alerta alerta-error" role="alert">
      <span>{error}</span>
      <button type="button" className="btn-mini" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}

function Encabezado({ usuario }) {
  return (
    <header className="encabezado">
      <div className="marca">
        <div className="marca-icono" aria-hidden="true">F</div>
        <div>
          <h1>Ferretería POS multisucursal</h1>
          <p className="subtitulo">
            Inventario y punto de venta · Cancún, Playa del Carmen y Chetumal
          </p>
          <p className="folio-linea">SERIE 2026 · HOJA 01 · MOSTRADOR MULTISUCURSAL</p>
        </div>
      </div>
      {usuario && (
        <div className="usuario-chip">
          <strong>{usuario.nombre}</strong>
          <span>{usuario.rol} · Sucursal {usuario.id_sucursal || "todas"}</span>
        </div>
      )}
    </header>
  );
}

function Login({ onLogin, setMensaje }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [procesando, setProcesando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setMensaje("");
    setProcesando(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo, clave }),
      });
      onLogin(data);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <form className="card login-card" onSubmit={enviar}>
      <span className="eyebrow">00 / Acceso al mostrador</span>
      <h3>Iniciar sesión</h3>
      <p className="texto-ayuda">Accede con tu usuario para comenzar a vender.</p>
      <div className="fila">
        <div className="col">
          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" value={correo} autoComplete="username" onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div className="col">
          <label htmlFor="clave">Clave</label>
          <input id="clave" type="password" value={clave} autoComplete="current-password" onChange={(e) => setClave(e.target.value)} required />
        </div>
      </div>
      <button type="submit" disabled={procesando}>{procesando ? "Entrando..." : "Entrar"}</button>
      <p className="demo">Demo: gerente.cancun@ferreteria.local / hash_demo_gerente</p>
      <p className="demo">Cajero: cajero1.cancun@ferreteria.local / hash_demo_cajero</p>
    </form>
  );
}

function Nav({ vista, setVista, puedeReportes, salir }) {
  const opciones = [
    { id: "productos", texto: "Productos" },
    { id: "inventario", texto: "Inventario" },
    { id: "pos", texto: "Punto de venta" },
  ];
  if (puedeReportes) opciones.push({ id: "reportes", texto: "Reportes" });
  return (
    <nav className="barra" aria-label="Navegación principal">
      {opciones.map((opcion, i) => (
        <button
          key={opcion.id}
          type="button"
          className={vista === opcion.id ? "activo" : "sec"}
          aria-current={vista === opcion.id ? "page" : undefined}
          onClick={() => setVista(opcion.id)}
        >
          <span className="nav-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          {opcion.texto}
        </button>
      ))}
      <button type="button" className="sec salir" onClick={salir}>Salir</button>
    </nav>
  );
}

export default function App() {
  const sesionInicial = leerSesion();
  const [usuario, setUsuario] = useState(sesionInicial?.usuario || null);
  const [vista, setVista] = useState(sesionInicial?.usuario ? "productos" : "login");
  const [sucursal, setSucursal] = useState(String(sesionInicial?.usuario?.id_sucursal || 1));
  const [sucursales, setSucursales] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const puedeReportes = ROLES_CON_REPORTES.includes(usuario?.rol);

  useEffect(() => {
    if (sesionInicial?.usuario) {
      api("/sucursales").then(setSucursales).catch(() => setSucursales([]));
    }
  }, []);

  function salir() {
    limpiarSesion();
    setUsuario(null);
    setVista("login");
    setSucursal("1");
    setMensaje("");
  }

  function nombreSucursal(id) {
    const encontrada = sucursales.find((s) => String(s.id_sucursal) === String(id));
    return encontrada?.nombre || NOMBRES_SUCURSAL[id] || `Sucursal ${id}`;
  }

  if (!usuario) {
    return (
      <div className="contenedor">
        <Encabezado />
        {mensaje && <p className="alerta alerta-error" role="alert">{mensaje}</p>}
        <Login
          setMensaje={setMensaje}
          onLogin={(data) => {
            guardarSesion(data.usuario, data.token);
            setUsuario(data.usuario);
            setSucursal(String(data.usuario.id_sucursal || 1));
            setVista("productos");
            setMensaje("");
          }}
        />
      </div>
    );
  }

  return (
    <div className="contenedor">
      <Encabezado usuario={usuario} />
      {mensaje && <p className="alerta alerta-error" role="alert">{mensaje}</p>}
      <Nav vista={vista} setVista={setVista} puedeReportes={puedeReportes} salir={salir} />
      <section className="card barra-sucursal">
        <label htmlFor="sucursal">Sucursal activa</label>
        <select id="sucursal" value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
          {(sucursales.length
            ? sucursales
            : Object.entries(NOMBRES_SUCURSAL).map(([id, nombre]) => ({ id_sucursal: id, nombre }))
          ).map((s) => (
            <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
          ))}
        </select>
        <span className="sucursal-actual">Vendiendo en: <strong>{nombreSucursal(sucursal)}</strong></span>
      </section>
      {vista === "productos" && <Productos puedeCrear={["administrador", "gerente"].includes(usuario.rol)} />}
      {vista === "inventario" && <Inventario sucursal={sucursal} nombreSucursal={nombreSucursal} />}
      {vista === "pos" && <POS sucursal={sucursal} nombreSucursal={nombreSucursal} />}
      {vista === "reportes" && puedeReportes && <Reportes />}
    </div>
  );
}

function Productos({ puedeCrear }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ sku: "", nombre: "", precio_mxn: "", tipo: "herramienta", etiquetas: "", descripcion: "" });
  const [mensajeForm, setMensajeForm] = useState(null);

  useEffect(() => {
    let activo = true;
    const t = setTimeout(async () => {
      try {
        const data = await api("/productos?q=" + encodeURIComponent(q));
        if (activo) {
          setItems(data);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setItems([]);
          setError(err.message);
        }
      }
    }, 250);
    return () => {
      activo = false;
      clearTimeout(t);
    };
  }, [q, intentos]);

  async function crear(e) {
    e.preventDefault();
    setMensajeForm(null);
    try {
      await api("/productos", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          precio_mxn: Number(form.precio_mxn),
          etiquetas: form.etiquetas.split(",").map((x) => x.trim()).filter(Boolean),
        }),
      });
      setMensajeForm({ tipo: "ok", texto: "Producto creado correctamente." });
      setForm({ sku: "", nombre: "", precio_mxn: "", tipo: "herramienta", etiquetas: "", descripcion: "" });
      setIntentos((n) => n + 1);
    } catch (err) {
      setMensajeForm({ tipo: "error", texto: err.message });
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <span className="eyebrow">01 / Mostrador</span>
          <h3>Catálogo de productos</h3>
          <p className="texto-ayuda">Búsqueda en vivo por nombre, SKU o etiqueta.</p>
        </div>
        <div className="acciones-header">
          <span className="contador">{items.length} resultado(s)</span>
          {puedeCrear && (
            <button type="button" className="sec" onClick={() => setMostrarForm((v) => !v)}>
              {mostrarForm ? "Ocultar formulario" : "Nuevo producto"}
            </button>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="buscar-productos">Buscar producto</label>
        <input
          id="buscar-productos"
          className="buscador"
          placeholder="Nombre, SKU o etiqueta"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <ErrorDatos error={error} onReintentar={() => setIntentos((n) => n + 1)} />
      {mostrarForm && puedeCrear && (
        <form className="formulario-producto" onSubmit={crear}>
          <div className="fila">
            <div className="col">
              <label htmlFor="nuevo-sku">SKU</label>
              <input id="nuevo-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            </div>
            <div className="col">
              <label htmlFor="nuevo-nombre">Nombre</label>
              <input id="nuevo-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="col">
              <label htmlFor="nuevo-precio">Precio MXN</label>
              <input id="nuevo-precio" type="number" min="0.01" step="0.01" value={form.precio_mxn} onChange={(e) => setForm({ ...form, precio_mxn: e.target.value })} required />
            </div>
            <div className="col">
              <label htmlFor="nuevo-tipo">Tipo</label>
              <select id="nuevo-tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="herramienta">Herramienta</option>
                <option value="material">Material</option>
                <option value="electrico">Eléctrico</option>
              </select>
            </div>
          </div>
          <div className="fila">
            <div className="col">
              <label htmlFor="nuevo-etiquetas">Etiquetas (separadas por coma)</label>
              <input id="nuevo-etiquetas" value={form.etiquetas} onChange={(e) => setForm({ ...form, etiquetas: e.target.value })} />
            </div>
            <div className="col">
              <label htmlFor="nuevo-descripcion">Descripción</label>
              <input id="nuevo-descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <button type="submit">Guardar producto</button>
          {mensajeForm && (
            <p className={`alerta alerta-${mensajeForm.tipo}`} role={mensajeForm.tipo === "error" ? "alert" : "status"}>
              {mensajeForm.texto}
            </p>
          )}
        </form>
      )}
      {items.length === 0 && !error ? (
        <p className="vacio">{q ? "No se encontraron productos con ese criterio." : "Escribe para buscar un producto."}</p>
      ) : (
        <div className="tabla-scroll">
          <table>
            <caption>Productos disponibles en el catálogo</caption>
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Nombre</th>
                <th scope="col" className="numero">Precio MXN</th>
                <th scope="col">Tipo</th>
                <th scope="col">Etiquetas</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.sku}</td>
                  <td>{p.nombre}</td>
                  <td className="numero">{formatoMXN(Number(p.precio_mxn))}</td>
                  <td>{p.tipo_tabla}</td>
                  <td>{(p.etiquetas || []).map((etiqueta) => <span className="etiqueta" key={etiqueta}>{etiqueta}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Inventario({ sucursal, nombreSucursal }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    let activo = true;
    api("/inventario?sucursal=" + sucursal)
      .then((data) => {
        if (activo) {
          setItems(data);
          setError("");
        }
      })
      .catch((err) => {
        if (activo) {
          setItems([]);
          setError(err.message);
        }
      });
    return () => { activo = false; };
  }, [sucursal, intentos]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <span className="eyebrow">02 / Almacén</span>
          <h3>Existencias por sucursal</h3>
          <p className="texto-ayuda">Stock actual y mínimo configurado para {nombreSucursal(sucursal)}.</p>
        </div>
        <span className="contador">{items.length} registro(s)</span>
      </div>
      <ErrorDatos error={error} onReintentar={() => setIntentos((n) => n + 1)} />
      {items.length === 0 && !error ? (
        <p className="vacio">No hay existencias registradas para esta sucursal.</p>
      ) : (
        <div className="tabla-scroll">
          <table>
            <caption>Existencias de {nombreSucursal(sucursal)}</caption>
            <thead>
              <tr>
                <th scope="col">Sucursal</th>
                <th scope="col">SKU</th>
                <th scope="col">Producto</th>
                <th scope="col" className="numero">Stock</th>
                <th scope="col" className="numero">Mínimo</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={i}>
                  <td>{r.sucursal}</td>
                  <td>{r.sku}</td>
                  <td>{r.producto}</td>
                  <td className="numero">{r.stock}</td>
                  <td className="numero">{r.stock_minimo}</td>
                  <td><BadgeStock stock={r.stock} minimo={r.stock_minimo} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function POS({ sucursal, nombreSucursal }) {
  const [q, setQ] = useState("");
  const [productos, setProductos] = useState([]);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [msg, setMsg] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let activo = true;
    const t = setTimeout(async () => {
      if (!q) {
        setProductos([]);
        setErrorBusqueda("");
        return;
      }
      try {
        const data = await api("/productos?q=" + encodeURIComponent(q));
        if (activo) {
          setProductos(data);
          setErrorBusqueda("");
        }
      } catch (err) {
        if (activo) {
          setProductos([]);
          setErrorBusqueda(err.message);
        }
      }
    }, 250);
    return () => {
      activo = false;
      clearTimeout(t);
    };
  }, [q]);

  function agregar(p) {
    setCarrito((actual) => {
      const existente = actual.find((x) => x.id_producto === p.id_producto);
      if (existente) {
        return actual.map((x) => x.id_producto === p.id_producto ? { ...x, cantidad: x.cantidad + 1 } : x);
      }
      return [...actual, { id_producto: p.id_producto, nombre: p.nombre, precio_unitario: Number(p.precio_mxn), cantidad: 1 }];
    });
  }

  function cambiarCantidad(idProducto, delta) {
    setCarrito((actual) => actual
      .map((r) => r.id_producto === idProducto ? { ...r, cantidad: r.cantidad + delta } : r)
      .filter((r) => r.cantidad > 0));
  }

  function quitar(idProducto) {
    setCarrito((actual) => actual.filter((r) => r.id_producto !== idProducto));
  }

  const total = carrito.reduce((suma, r) => suma + r.cantidad * r.precio_unitario, 0);

  async function cobrar() {
    if (procesando || !carrito.length) return;
    setMsg(null);
    setProcesando(true);
    try {
      const data = await api("/ventas", {
        method: "POST",
        body: JSON.stringify({
          folio: "V-" + Date.now(),
          id_sucursal: Number(sucursal),
          items: carrito.map((r) => ({ id_producto: r.id_producto, cantidad: r.cantidad, precio_unitario: r.precio_unitario })),
        }),
      });
      setMsg({ tipo: "ok", texto: "Venta registrada. ID: " + data.id_venta });
      setCarrito([]);
    } catch (err) {
      setMsg({ tipo: "error", texto: err.message });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="pos-grid">
      <section className="card">
        <div className="card-header">
          <div>
            <span className="eyebrow">03 / Venta · búsqueda</span>
            <h3>Buscar producto</h3>
            <p className="texto-ayuda">Agrega artículos al carrito desde aquí.</p>
          </div>
        </div>
        <label htmlFor="buscar-pos">Buscar productos para el carrito</label>
        <input id="buscar-pos" className="buscador" placeholder="Nombre, SKU o etiqueta" value={q} onChange={(e) => setQ(e.target.value)} />
        <ErrorDatos error={errorBusqueda} onReintentar={() => setQ((v) => v + " ")} />
        {productos.length === 0 && !errorBusqueda ? (
          <p className="vacio">{q ? "No hay productos que coincidan." : "Escribe para buscar un producto."}</p>
        ) : (
          <ul className="producto-lista">
            {productos.map((p) => (
              <li className="producto-item" key={p.id_producto}>
                <div className="producto-info">
                  <strong>{p.nombre}</strong>
                  <small>{p.sku} · {p.tipo_tabla}</small>
                </div>
                <span className="producto-precio">{formatoMXN(Number(p.precio_mxn))}</span>
                <button type="button" className="btn-mini" onClick={() => agregar(p)}>Agregar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <span className="eyebrow">03 / Venta · cobro</span>
            <h3>Carrito</h3>
            <p className="texto-ayuda">Sucursal: {nombreSucursal(sucursal)}</p>
          </div>
          <span className="contador">{carrito.length} artículo(s)</span>
        </div>
        {carrito.length === 0 ? (
          <p className="vacio">El carrito está vacío. Busca un producto y agrégalo.</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla-carrito">
              <caption>Resumen del carrito</caption>
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col" className="numero">Precio</th>
                  <th scope="col" className="numero">Importe</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((r) => (
                  <tr key={r.id_producto}>
                    <td>{r.nombre}</td>
                    <td>
                      <div className="control-cantidad">
                        <button type="button" className="btn-cantidad" aria-label={`Quitar una unidad de ${r.nombre}`} onClick={() => cambiarCantidad(r.id_producto, -1)}>-</button>
                        <span>{r.cantidad}</span>
                        <button type="button" className="btn-cantidad" aria-label={`Agregar una unidad de ${r.nombre}`} onClick={() => cambiarCantidad(r.id_producto, 1)}>+</button>
                      </div>
                    </td>
                    <td className="numero">{formatoMXN(r.precio_unitario)}</td>
                    <td className="numero">{formatoMXN(r.cantidad * r.precio_unitario)}</td>
                    <td><button type="button" className="btn-mini peligro" onClick={() => quitar(r.id_producto)}>Quitar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="total-caja"><span>Total</span><strong>{formatoMXN(total)}</strong></div>
        {msg && <p className={`alerta alerta-${msg.tipo}`} role={msg.tipo === "error" ? "alert" : "status"}>{msg.texto}</p>}
        <div className="acciones-carrito">
          <button type="button" className="sec" onClick={() => setCarrito([])} disabled={!carrito.length || procesando}>Vaciar carrito</button>
          <button type="button" onClick={cobrar} disabled={!carrito.length || procesando}>{procesando ? "Procesando..." : "Confirmar venta"}</button>
        </div>
      </section>
    </div>
  );
}

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [existencias, setExistencias] = useState([]);
  const [errorVentas, setErrorVentas] = useState("");
  const [errorExistencias, setErrorExistencias] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [cp, setCp] = useState("77500");
  const [postal, setPostal] = useState(null);
  const [errorPostal, setErrorPostal] = useState("");
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    api("/reportes/ventas-sucursal").then((data) => { setVentas(data); setErrorVentas(""); }).catch((err) => setErrorVentas(err.message));
    api("/reportes/existencias-consolidado").then((data) => { setExistencias(data); setErrorExistencias(""); }).catch((err) => setErrorExistencias(err.message));
  }, [intentos]);

  async function consultarCP(e) {
    e.preventDefault();
    setErrorPostal("");
    setPostal(null);
    if (!/^\d{5}$/.test(cp)) {
      setErrorPostal("Escribe un código postal de 5 dígitos.");
      return;
    }
    setConsultando(true);
    try {
      setPostal(await api("/codigos-postales/" + cp));
    } catch (err) {
      setErrorPostal(err.message);
    } finally {
      setConsultando(false);
    }
  }

  return (
    <div className="reportes-grid">
      <section className="card reporte-card">
        <span className="eyebrow">04 / Servicio externo</span>
        <h3>Consulta de código postal</h3>
        <p className="texto-ayuda">Datos reales de SEPOMEX servidos por la API Postali, sin token.</p>
        <form className="formulario-postal" onSubmit={consultarCP}>
          <label htmlFor="cp">Código postal</label>
          <input id="cp" inputMode="numeric" pattern="[0-9]{5}" maxLength="5" value={cp} onChange={(e) => setCp(e.target.value.replace(/\D/g, ""))} required />
          <button type="submit" disabled={consultando}>{consultando ? "Consultando..." : "Consultar"}</button>
        </form>
        {errorPostal && <p className="alerta alerta-error" role="alert">{errorPostal}</p>}
        {postal && (
          <div className="postal-resultado" role="status">
            <p><strong>{postal.cp}</strong> · {postal.estado} · {postal.municipio}</p>
            <p className="texto-ayuda">{postal.total} asentamiento(s) encontrado(s)</p>
            <ul className="lista-asentamientos">
              {postal.asentamientos.map((a) => <li key={a.nombre}>{a.nombre} ({a.tipo})</li>)}
            </ul>
          </div>
        )}
      </section>
      <section className="card reporte-card">
        <span className="eyebrow">04 / Ventas</span>
        <h3>Ventas por sucursal</h3>
        <ErrorDatos error={errorVentas} onReintentar={() => setIntentos((n) => n + 1)} />
        {ventas.length === 0 && !errorVentas ? <p className="vacio">Sin ventas registradas.</p> : (
          <div className="tabla-scroll">
            <table>
              <caption>Ventas consolidadas por sucursal</caption>
              <thead><tr><th scope="col">Sucursal</th><th scope="col" className="numero"># Ventas</th><th scope="col" className="numero">Total vendido</th></tr></thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id_sucursal}>
                    <td>{v.sucursal}</td>
                    <td className="numero">{v.numero_ventas}</td>
                    <td className="numero">{formatoMXN(Number(v.total_vendido))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="card reporte-card">
        <span className="eyebrow">04 / Stock total</span>
        <h3>Existencias consolidadas</h3>
        <ErrorDatos error={errorExistencias} onReintentar={() => setIntentos((n) => n + 1)} />
        {existencias.length === 0 && !errorExistencias ? <p className="vacio">Sin existencias registradas.</p> : (
          <div className="tabla-scroll">
            <table>
              <caption>Stock total por producto en todas las sucursales</caption>
              <thead><tr><th scope="col">SKU</th><th scope="col">Producto</th><th scope="col" className="numero">Stock total</th></tr></thead>
              <tbody>
                {existencias.map((e) => (
                  <tr key={e.id_producto}>
                    <td>{e.sku}</td>
                    <td>{e.producto}</td>
                    <td className="numero">{e.stock_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

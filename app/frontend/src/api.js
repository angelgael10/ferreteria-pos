// Prefijo de las rutas del backend y llave donde se guarda la sesión.
const BASE = "/api";
const CLAVE_SESION = "ferreteria-pos-sesion";

// Guarda usuario y token en sessionStorage durante la pestaña activa.
export function guardarSesion(usuario, token) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ usuario, token }));
}

// Recupera la sesión guardada; si el JSON está dañado devuelve null.
export function leerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "null");
  } catch {
    return null;
  }
}

// Elimina la sesión al cerrar sesión o cuando el token deja de ser válido.
export function limpiarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

// Cliente de la API: agrega token, interpreta JSON y convierte errores en excepciones.
export async function api(path, options = {}) {
  const sesion = leerSesion();
  const headers = {
    "Content-Type": "application/json",
    ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) limpiarSesion();
  if (!res.ok) throw new Error(data.error || "Error en la petición");
  return data;
}

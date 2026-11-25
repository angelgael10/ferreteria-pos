const BASE = "/api";
const CLAVE_SESION = "ferreteria-pos-sesion";

export function guardarSesion(usuario, token) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ usuario, token }));
}

export function leerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "null");
  } catch {
    return null;
  }
}

export function limpiarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

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

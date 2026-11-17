// api.js - funciones auxiliares para consumir la API del backend
const BASE = '/api'; // prefijo base de la API (proxy de Vite lo redirige al backend)

// Función genérica para hacer peticiones HTTP y devolver JSON
export async function api(path, options = {}) { // exporta la función api
  const res = await fetch(BASE + path, { // realiza la petición fetch a la ruta indicada
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, // envía JSON por defecto
    ...options, // mezcla otras opciones (method, body, etc.)
  }); // fin de fetch
  const data = await res.json().catch(() => ({})); // intenta parsear la respuesta como JSON
  if (!res.ok) throw new Error(data.error || 'Error en la petición'); // lanza error si la respuesta no es OK
  return data; // devuelve los datos parseados
} // fin de la función api

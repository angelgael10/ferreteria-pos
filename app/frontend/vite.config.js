// vite.config.js - configuración de Vite para el frontend React
import { defineConfig } from 'vite'; // importa la función para definir la configuración
import react from '@vitejs/plugin-react'; // importa el plugin de React para Vite

// Exporta la configuración de Vite
export default defineConfig({ // define y exporta la configuración
  plugins: [react()], // habilita el soporte de React (JSX, fast refresh)
  server: { // configuración del servidor de desarrollo
    port: 5173, // puerto donde correrá el frontend en desarrollo
    proxy: { // proxy para redirigir llamadas /api al backend Express
      '/api': 'http://localhost:3001', // envía peticiones /api al backend en puerto 3001
    }, // fin de proxy
  }, // fin de server
}); // fin de defineConfig

// main.jsx - punto de entrada de la aplicación React
import React from 'react'; // importa la librería React
import ReactDOM from 'react-dom/client'; // importa el API para renderizar en el DOM
import App from './App.jsx'; // importa el componente principal App
import './styles.css'; // importa los estilos globales
import './diseno.css';
import './colores.css';
import './tipografia.css';


// Crea la raíz de React en el elemento con id "root" y renderiza la aplicación
ReactDOM.createRoot(document.getElementById('root')).render( // monta la app en #root
  <React.StrictMode> {/* activa comprobaciones adicionales en desarrollo */}
    <App /> {/* renderiza el componente principal */}
  </React.StrictMode> // fin de StrictMode
); // fin del renderizado

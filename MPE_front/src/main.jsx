import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './app';
import './index.css';

// Bloque prerender jusqu'à ce que la page ait fini de charger ses données.
// Chaque page doit poser window.prerenderReady = true quand elle est prête.
window.prerenderReady = false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

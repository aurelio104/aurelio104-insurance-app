import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importa estilos globales
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext'; // Proveedor de autenticación para gestionar el estado de inicio de sesión

// Renderizar la aplicación principal en el elemento con id "root"
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider envuelve la aplicación para manejar el estado de autenticación global */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

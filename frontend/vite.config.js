import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Usar import.meta.env para acceder correctamente a la variable de entorno en Vite
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

console.log("🚀 VITE_API_URL en build:", API_URL);

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Asegura que el proxy funcione correctamente
      },
    },
  },
  resolve: {
    alias: {
      '@mui/styled-engine': path.resolve(__dirname, 'node_modules/@mui/styled-engine-sc'),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(API_URL), // 🔹 Asegurar que VITE_API_URL está disponible en build
  },
});

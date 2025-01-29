import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Definir la API base utilizando la variable de entorno correcta para Vite
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

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
    'process.env': {
      VITE_API_URL: JSON.stringify(API_URL),
    },
  },
});

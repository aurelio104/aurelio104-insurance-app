import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Usar VITE_API_URL correctamente y manejar undefined
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

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
    'process.env': {
      VITE_API_URL: JSON.stringify(API_URL),
    },
  },
});

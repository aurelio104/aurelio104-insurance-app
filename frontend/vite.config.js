import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Leer la variable correctamente en Vite
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
      },
    },
  },
  resolve: {
    alias: {
      '@mui/styled-engine': path.resolve(__dirname, 'node_modules/@mui/styled-engine-sc'),
    },
  },
});

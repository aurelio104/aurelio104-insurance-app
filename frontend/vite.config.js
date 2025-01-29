import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Verifica si la variable existe antes de acceder a ella
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
      },
    },
  },
  resolve: {
    alias: {
      '@mui/styled-engine': path.resolve(__dirname, 'node_modules/@mui/styled-engine-sc'),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(API_URL), // 🔹 Esto asegura que esté disponible en el build
  },
});

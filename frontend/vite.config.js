import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Definir la API base utilizando la variable de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/policies': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/payments': {
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
    'process.env': {
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:5000'),
    },
  },
});

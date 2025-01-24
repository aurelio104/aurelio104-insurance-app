import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/policies': { // Añade esta entrada si falta
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/payments': {
        target: 'http://localhost:5000',
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
    'process.env': {},
  },
});

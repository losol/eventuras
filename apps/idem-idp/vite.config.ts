import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist-ui',
    emptyOutDir: true,
  },

  server: {
    port: 3210,
    proxy: {
      // Proxy API requests to Express backend
      '/api': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      // Proxy OIDC endpoints
      '/auth': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      '/token': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      '/userinfo': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      // Proxy interaction API endpoints (but not the page route)
      // Pattern matches: /interaction/:uid/details, /interaction/:uid/login, etc.
      '^/interaction/[^/]+/(details|login|consent)': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/ui'),
    },
  },
});

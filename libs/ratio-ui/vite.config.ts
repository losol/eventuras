/**
 * Vite configuration for Eventuras UI library (ES-only build).
 */
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({
    entryRoot: 'src',
    outDir: 'dist',
    include: ['src/**/*'],
    copyDtsFiles: true,
    rollupTypes: true,
  })],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'ratio-ui.es.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // mirror src structure in dist
        preserveModules: true,
        preserveModulesRoot: 'src',
        // nice file names (no hashes)
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})

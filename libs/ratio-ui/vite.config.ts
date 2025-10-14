import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],  // Be explicit about what to include
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
      copyDtsFiles: false,  // Don't just copy, generate them
      rollupTypes: false,   // Keep individual .d.ts files to match your structure
      insertTypesEntry: true,  // Add types field to package.json
    })
  ],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  build: {
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/**/index.ts')),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});

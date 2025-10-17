import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'Image/index': resolve(__dirname, 'src/Image/index.ts'),
        'Link/index': resolve(__dirname, 'src/Link/index.ts'),
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'next', 'next/image', 'next/link', '@eventuras/ratio-ui'],
      output: {
        preserveModules: false,
      },
    },
  },
});

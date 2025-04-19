/**
 * Vite configuration for Eventuras UI library.
 */
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// With lots of inspiration from https://dev.to/receter/how-to-create-a-react-component-library-using-vites-library-mode-4lma
export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
    }),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      name: 'EventurasUI',
      fileName: (format) => `eventuras-ui.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],

      input: Object.fromEntries(
        glob.sync('src/**/*.{ts,tsx}').map(file => [
          // The name of the entry point
          // src/nested/foo.ts becomes nested/foo
          relative(
            'src',
            file.slice(0, file.length - extname(file).length)
          ),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});

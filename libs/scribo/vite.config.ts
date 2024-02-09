import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// Check build mode
const buildSite = process.env.BUILD_SITE === 'true';

export default defineConfig({
  plugins: [react()],
  build: buildSite
    ? {
      // Build demo site
      outDir: 'dist/site',
      }
    : {
      // Build library
        lib: {
          entry: resolve(__dirname, 'src/main.tsx'),
          name: 'Scribo',
          fileName: 'scribo',
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
});

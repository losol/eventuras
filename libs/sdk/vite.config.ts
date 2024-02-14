import { defineConfig } from 'vite';
import { resolve } from 'path';

// Check build mode
const buildSite = process.env.BUILD_SITE === 'true';

export default defineConfig({
  plugins: [],
  build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'EventurasSDK',
          fileName: 'eventuras',
        },
      },
});

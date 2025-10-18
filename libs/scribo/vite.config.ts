import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';
import { resolve } from 'path';

// Check build mode
const buildSite = process.env.BUILD_SITE === 'true';

export default buildSite
  ? // Build demo site
    {
      build: {
        outDir: 'dist/site',
      },
    }
  : // Build library
    defineReactLibConfig({
      entry: 'src/main.tsx',
      useSWC: true,
    });

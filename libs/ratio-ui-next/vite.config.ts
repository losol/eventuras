import { defineNextLibConfig } from '@eventuras/vite-config/next-lib';
import { resolve } from 'path';

export default defineNextLibConfig({
  entry: {
    'Image/index': resolve(__dirname, 'src/Image/index.ts'),
    'Link/index': resolve(__dirname, 'src/Link/index.ts'),
    index: resolve(__dirname, 'src/index.ts'),
  },
  external: ['@eventuras/ratio-ui'],
  preserveModules: false,
});

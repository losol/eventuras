import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  tailwind: true,
  external: [
    'markdown-to-jsx',
    '@eventuras/ratio-ui',
    // for deep imports..:
    /^@eventuras\/ratio-ui\//
  ],
});

import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  external: [
    '@eventuras/ratio-ui',
    /^@eventuras\/ratio-ui\//,
  ],
});

import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.ts',
    'build-index': 'src/build-index.ts',
  },
  external: [
    '@orama/orama',
    '@orama/plugin-data-persistence',
    /^@eventuras\//,
    /^node:/,
  ],
});

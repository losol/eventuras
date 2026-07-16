import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: {
    index: 'src/index.ts',
    'search/index': 'src/search/index.ts',
    'search/build-index': 'src/search/build-index.ts',
    'search/react': 'src/search/react.ts',
  },
  external: [
    '@orama/orama',
    '@orama/plugin-data-persistence',
    'fast-glob',
    /^@eventuras\//,
    /^node:/,
  ],
});

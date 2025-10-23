import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  external: [
    // State management
    'xstate',
    '@xstate/react',
    /^@xstate\//,

    // React internals
    'use-sync-external-store',
    /^use-sync-external-store\//,

    // Utilities
    'uuid',

    // Workspace dependencies
    '@eventuras/ratio-ui',
  ],
});

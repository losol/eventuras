import { defineNextLibConfig } from '@eventuras/vite-config/next-lib';

export default defineNextLibConfig({
  entry: {
    index: 'src/index.ts',
    session: 'src/session.ts',
    request: 'src/request.ts',
    'store/index': 'src/store/index.ts',
  },
  external: [
    // State management
    'xstate',
    '@xstate/react',
    '@xstate/store',
    '@xstate/store/react',
    /^@xstate\//,

    // React
    'react',
    'react-dom',
    /^react\//,

    // React internals
    'use-sync-external-store',
    /^use-sync-external-store\//,

    // Workspace dependencies
    '@eventuras/fides-auth',
    '@eventuras/logger',
  ],
});

import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  external: [
    // Peer dependencies
    'react-hook-form',
    'react-aria-components',
    '@tabler/icons-react',
    // Workspace packages - should not be bundled
    '@eventuras/ratio-ui',
    '@eventuras/logger',
    // External subpath imports from ratio-ui
    /^@eventuras\/ratio-ui\//,
  ],
});

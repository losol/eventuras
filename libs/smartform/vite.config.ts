import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  external: [
    'react-hook-form',
    'react-aria-components',
    '@tabler/icons-react',
  ],
});

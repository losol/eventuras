import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/**/index.{ts,tsx}',
  tailwind: true,
  preserveUseClientDirectives: true,
  external: [
    'react-aria-components',
    /^@react-aria\//,
    /^@react-stately\//,
    /^@internationalized\//,
    /^@swc\/helpers/,
    /^lucide-react/,
    'clsx',
  ],
});

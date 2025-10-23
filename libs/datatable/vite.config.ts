import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  external: [
    // TanStack libraries
    '@tanstack/react-table',
    '@tanstack/table-core',
    '@tanstack/match-sorter-utils',
    /^@tanstack\//,

    // Icons
    'lucide-react',

    // Workspace dependencies
    '@eventuras/ratio-ui',
  ],
});

import { defineConfig } from '@hey-api/openapi-ts';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default defineConfig({
  input: {
    // Resolve via the @eventuras/api workspace package's exports map so that
    // Docker builds (which use turbo prune) automatically include the spec
    // file as part of the workspace dependency graph.
    path: require.resolve('@eventuras/api/openapi'),
  },
  output: 'src/client-next',
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    },
    {
      name: '@hey-api/sdk',
      client: '@hey-api/client-next',
    },
  ],
});

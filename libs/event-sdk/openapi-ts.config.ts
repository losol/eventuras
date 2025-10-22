import { defineConfig } from '@hey-api/openapi-ts';
import { resolve } from 'node:path';

export default defineConfig({
  input: {
    // Resolve the OpenAPI spec from @eventuras/api package
    path: resolve(
      import.meta.dirname,
      'node_modules/@eventuras/api/docs/eventuras-v3.json'
    ),
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

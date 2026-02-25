import { defineConfig } from '@hey-api/openapi-ts';
import { resolve } from 'node:path';

export default defineConfig({
  input: {
    path: resolve(import.meta.dirname, 'eventuras-v3.json'),
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

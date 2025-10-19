import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: {
    path: './swagger.json',
    // exclude: 'components/schemas/EventFormDtoJsonPatchDocument',
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

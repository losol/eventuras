import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: {
    path: './swagger.json',
    // exclude: 'components/schemas/EventFormDtoJsonPatchDocument',
  },
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '../clientConfig',
    },
    // {
    //   name: '@hey-api/typescript',
    //   // readOnlyWriteOnlyBehavior: 'off',
    // },
  ],
});

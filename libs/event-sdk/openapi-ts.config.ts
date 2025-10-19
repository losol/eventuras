import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: {
    path: './swagger.json',
    // exclude: 'components/schemas/EventFormDtoJsonPatchDocument',
  },
  output: 'src/client-next',
  plugins: [
    {
      name: '@hey-api/client-next',
      // Runtime config will be provided by consuming apps
      runtimeConfigPath: '../clientConfig',
    },
    // {
    //   name: '@hey-api/typescript',
    //   // readOnlyWriteOnlyBehavior: 'off',
    // },
  ],
});

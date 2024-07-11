import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: 'fetch',
  input: 'swagger.json',
  output: 'src/fetch',
});

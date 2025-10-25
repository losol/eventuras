import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: 'src/index.ts',
  external: [/^googleapis(\/.*)?$/, /^google-auth-library(\/.*)?$/],
});

import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: 'src/index.ts',
  external: ['fs', 'path', 'zod'],
});

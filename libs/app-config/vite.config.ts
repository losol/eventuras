import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    clientside: 'src/clientside.ts',
  },
  external: ['fs', 'path', 'zod'],
});

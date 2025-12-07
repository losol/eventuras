import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    clientside: 'src/clientside.ts',
    generator: 'src/generator.ts',
    cli: 'src/cli.ts',
  },
  external: ['fs', 'path', 'fs/promises', 'zod'],
});

import { defineConfig } from 'vite';
import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineConfig(
  defineVanillaLibConfig({
    entry: {
      'core/index': './src/core/index.ts',
      'bring-v1/index': './src/bring-v1/index.ts',
    },
    external: ['node:*'],
  })
);

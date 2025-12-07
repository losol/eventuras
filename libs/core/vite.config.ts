import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    'regex/index': 'src/regex/index.ts',
    'datetime/index': 'src/datetime/index.ts',
    'currency/index': 'src/currency/index.ts',
  },
});

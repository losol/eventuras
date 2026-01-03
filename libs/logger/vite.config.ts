import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    opentelemetry: 'src/opentelemetry.ts',
  },
});

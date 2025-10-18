import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/**/index.ts',
  tailwind: true,
  preserveUseClientDirectives: true,
});

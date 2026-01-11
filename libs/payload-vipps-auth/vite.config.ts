import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: 'src/index.ts',
  external: [
    /^@eventuras\//,
    /^@payloadcms\//,
    'payload',
    'openid-client',
    'react',
    'react/jsx-runtime',
  ],
});

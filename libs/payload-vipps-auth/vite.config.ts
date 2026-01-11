import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
  },
  external: [
    /^@eventuras\//,
    /^@payloadcms\//,
    'payload',
    'openid-client',
    'react',
    'react/jsx-runtime',
  ],
});

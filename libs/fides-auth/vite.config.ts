import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    'session-refresh': 'src/session-refresh.ts',
    'session-validation': 'src/session-validation.ts',
    oauth: 'src/oauth.ts',
    'silent-login': 'src/silent-login.ts',
    utils: 'src/utils.ts',
    types: 'src/types.ts',
    'rate-limit': 'src/rate-limit.ts',
  },
});

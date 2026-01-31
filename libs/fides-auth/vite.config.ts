import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    'session-refresh': 'src/session-refresh.ts',
    'session-validation': 'src/session-validation.ts',
    oauth: 'src/oauth.ts',
    'oauth-browser': 'src/oauth-browser.ts',
    'silent-login': 'src/silent-login.ts',
    utils: 'src/utils.ts',
    types: 'src/types.ts',
    'rate-limit': 'src/rate-limit.ts',
    'providers/vipps/index': 'src/providers/vipps/index.ts',
  },
});

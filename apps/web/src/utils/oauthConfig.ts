import type { OAuthConfig } from '@eventuras/fides-auth-next';

import { appConfig } from '@/config.server';

export const redirect_uri = (appConfig.env.APPLICATION_URL ?? '') + '/api/login/auth0/callback';

export const oauthConfig: OAuthConfig = {
  issuer: 'https://' + (appConfig.env.AUTH0_DOMAIN ?? ''),
  clientId: String(appConfig.env.AUTH0_CLIENT_ID ?? ''),
  clientSecret: String(appConfig.env.AUTH0_CLIENT_SECRET ?? ''),
  redirect_uri: redirect_uri,
  scope: 'openid profile email offline_access',
};

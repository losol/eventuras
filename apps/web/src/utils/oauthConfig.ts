import type { OAuthConfig } from '@eventuras/fides-auth-next';

import { appConfig } from '@/config.server';

export const redirect_uri = (appConfig.env.APPLICATION_URL ?? '') + '/api/auth/callback/oidc';

export const oauthConfig: OAuthConfig = {
  issuer: String(appConfig.env.OIDC_ISSUER ?? ''),
  clientId: String(appConfig.env.OIDC_CLIENT_ID ?? ''),
  clientSecret: String(appConfig.env.OIDC_CLIENT_SECRET ?? ''),
  redirect_uri: redirect_uri,
  scope: 'openid profile email offline_access',
};

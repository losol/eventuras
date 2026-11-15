import { joinUrl } from '@eventuras/core/url';
import type { OidcClientConfig } from '@eventuras/fides-auth';

import { appConfig } from '@/config.server';

export const applicationUrl = String(appConfig.env.APPLICATION_URL ?? '');

export const oauthConfig: OidcClientConfig = {
  issuer: String(appConfig.env.OIDC_ISSUER ?? ''),
  clientId: String(appConfig.env.OIDC_CLIENT_ID ?? ''),
  clientSecret: String(appConfig.env.OIDC_CLIENT_SECRET ?? ''),
  redirectUri: joinUrl(applicationUrl, '/api/auth/callback/oidc'),
  scope: 'openid profile email offline_access',
};

/** Encrypts the session cookies: 64 hex characters (32 bytes). */
export const sessionSecret = String(appConfig.env.SESSION_SECRET ?? '');

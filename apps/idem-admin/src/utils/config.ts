import type { OAuthConfig } from '@eventuras/fides-auth-next';

/**
 * OAuth configuration for idem-idp
 * Confidential client with client secret
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3210';
const idemIdpUrl = process.env.NEXT_PUBLIC_IDEM_IDP_URL ?? 'http://localhost:3100';

export const redirect_uri = `${appUrl}/api/callback`;

export const oauthConfig: OAuthConfig = {
  issuer: idemIdpUrl,
  clientId: process.env.IDEM_CLIENT_ID ?? 'idem-admin',
  clientSecret: process.env.IDEM_CLIENT_SECRET ?? 'idem-admin-dev-secret',
  redirect_uri,
  scope: 'openid profile email',
};

export const config = {
  appUrl,
  idemIdpUrl,
  sessionSecret: process.env.SESSION_SECRET ?? '',
};

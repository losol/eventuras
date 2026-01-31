import type { OAuthConfig } from '@eventuras/fides-auth-next';

/**
 * OAuth configuration for idem-idp
 * Confidential client with client secret
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3210';
const idemIdpUrl = process.env.NEXT_PUBLIC_IDEM_IDP_URL ?? 'http://localhost:3100';

export const redirect_uri = `${appUrl}/api/callback`;

// Get client credentials with production validation
const clientId = process.env.IDEM_ADMIN_CLIENT_ID ?? 'idem-admin';

function getClientSecret(): string {
  const secret = process.env.IDEM_ADMIN_CLIENT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('IDEM_ADMIN_CLIENT_SECRET must be set in production environment.');
  }
  // In non-production environments, fall back to a development secret.
  return 'idem-admin-dev-secret';
}

export const oauthConfig: OAuthConfig = {
  issuer: idemIdpUrl,
  clientId,
  clientSecret: getClientSecret(),
  redirect_uri,
  scope: 'openid profile email',
};

export const config = {
  appUrl,
  idemIdpUrl,
  sessionSecret: process.env.SESSION_SECRET ?? '',
};

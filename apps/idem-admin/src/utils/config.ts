import type { OAuthConfig } from '@eventuras/fides-auth-next';

/**
 * OAuth configuration for idem-idp
 * Confidential client with client secret
 *
 * Uses lazy initialization to avoid throwing during Next.js build phase
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
  // In non-production environments, fall back to a development secret.
  if (process.env.NODE_ENV !== 'production') {
    return 'idem-admin-dev-secret';
  }
  // In production, require the secret (this will fail at runtime, not build time)
  throw new Error('IDEM_ADMIN_CLIENT_SECRET must be set in production environment.');
}

// Cached config - initialized lazily on first access
let _oauthConfig: OAuthConfig | null = null;

export function getOAuthConfig(): OAuthConfig {
  if (!_oauthConfig) {
    _oauthConfig = {
      issuer: idemIdpUrl,
      clientId,
      clientSecret: getClientSecret(),
      redirect_uri,
      scope: 'openid profile email',
    };
  }
  return _oauthConfig;
}

// Keep the old export for backwards compatibility during build
// This will only be evaluated if accessed, which shouldn't happen during SSG
export const oauthConfig: OAuthConfig = {
  issuer: idemIdpUrl,
  clientId,
  // Use a placeholder during build - actual usage should call getOAuthConfig()
  get clientSecret() {
    return getClientSecret();
  },
  redirect_uri,
  scope: 'openid profile email',
};

export const config = {
  appUrl,
  idemIdpUrl,
  sessionSecret: process.env.SESSION_SECRET ?? '',
};

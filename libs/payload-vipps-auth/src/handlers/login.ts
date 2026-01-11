/**
 * Vipps Login Handler - Initiates OAuth flow
 */

import { Logger } from '@eventuras/logger';
import { VippsLoginClient, getVippsIssuer } from '@eventuras/fides-auth/providers/vipps';
import type { ResolvedVippsAuthConfig } from '../types';

const logger = Logger.create({
  namespace: 'payload-vipps-auth:handlers',
  context: { module: 'LoginHandler' },
});

/**
 * Handle Vipps login request
 * Initiates OAuth flow with PKCE
 *
 * @param request - Incoming request (used to compute redirect URI for multitenant)
 * @param config - Vipps authentication configuration
 * @returns Response with redirect to Vipps authorization URL
 */
export async function handleVippsLogin(
  request: Request,
  config: ResolvedVippsAuthConfig
): Promise<Response> {
  logger.info('Handling Vipps login request');

  try {
    // Compute redirect URI from request if not explicitly configured
    const url = new URL(request.url);
    const redirectUri = config.redirectUri || `${url.origin}/api/auth/vipps/callback`;

    const client = new VippsLoginClient({
      issuer: getVippsIssuer(config.apiUrl),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri,
      scope: config.scope,
      subscriptionKey: config.subscriptionKey,
      merchantSerialNumber: config.merchantSerialNumber,
    });

    // Generate PKCE parameters
    const pkce = await client.buildPKCEOptions();

    logger.info({ state: pkce.state }, 'PKCE parameters generated');

    // Build authorization URL
    const authUrl = await client.buildAuthorizationUrl(pkce);

    logger.info(
      {
        state: pkce.state,
        redirectUri,
      },
      'Redirecting to Vipps authorization'
    );

    // Store PKCE code verifier in an HttpOnly cookie.
    // This survives Next.js dev reloads and avoids relying on in-memory state.
    const isSecure = url.protocol === 'https:';
    const cookieName = `vipps_pkce_${pkce.state}`;
    const cookieValue = encodeURIComponent(pkce.code_verifier);
    const redirectCookieName = `vipps_redirect_${pkce.state}`;
    const redirectCookieValue = encodeURIComponent(redirectUri);

    // NOTE: In some runtimes, `Response.redirect()` returns an immutable Headers object.
    // Construct the redirect response explicitly to avoid mutating headers.
    const headers = new Headers({
      Location: authUrl.toString(),
    });

    headers.append(
      'Set-Cookie',
      `${cookieName}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isSecure ? '; Secure' : ''}`
    );

    headers.append(
      'Set-Cookie',
      `${redirectCookieName}=${redirectCookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isSecure ? '; Secure' : ''}`
    );

    return new Response(null, { status: 302, headers });
  } catch (error) {
    logger.error({ error }, 'Failed to initiate Vipps login');
    return new Response('Failed to initiate login', { status: 500 });
  }
}

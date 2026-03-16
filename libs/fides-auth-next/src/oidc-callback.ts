/**
 * Generic OIDC callback handler for Next.js route handlers.
 *
 * Orchestrates the Next.js-specific concerns (cookies, rate limiting, HTTP responses)
 * while delegating OIDC logic to @eventuras/fides-auth.
 */

import type { OAuthConfig } from '@eventuras/fides-auth/oauth';
import {
  buildSessionFromTokens,
  exchangeAuthorizationCode,
  validateReturnUrl,
} from '@eventuras/fides-auth/oauth';
import { Logger } from '@eventuras/logger';

import {
  getAuthCookie,
  setSessionCookie,
  deleteAuthCookies,
} from './cookies';
import { globalGETRateLimit } from './request';
import { createSession } from './session';

const logger = Logger.create({ namespace: 'fides-auth-next:oidc-callback' });

export interface OidcCallbackConfig {
  /** OAuth/OIDC configuration (issuer, clientId, clientSecret, redirect_uri, scope) */
  oauthConfig: OAuthConfig;

  /** Public application URL (used to reconstruct the callback URL and validate redirects) */
  applicationUrl: string;

  /**
   * Name of the ID token claim that contains user roles.
   * @default 'roles'
   */
  rolesClaim?: string;

  /**
   * Session duration in days.
   * @default 7
   */
  sessionDurationDays?: number;

  /**
   * Default path to redirect to after login if no returnTo cookie is set.
   * @default '/'
   */
  defaultRedirectPath?: string;

  /**
   * Optional function to validate the returnTo path.
   * If not provided, only same-origin paths are allowed.
   */
  validateReturnTo?: (path: string) => boolean;
}

/**
 * Handles the OIDC callback in a Next.js route handler.
 *
 * @example
 * ```ts
 * // In app/api/auth/callback/oidc/route.ts
 * import { handleOidcCallback } from '@eventuras/fides-auth-next/oidc-callback';
 *
 * export async function GET(request: Request) {
 *   return handleOidcCallback(request, {
 *     oauthConfig,
 *     applicationUrl: 'https://example.com',
 *     rolesClaim: 'roles',
 *   });
 * }
 * ```
 */
export async function handleOidcCallback(
  request: Request,
  config: OidcCallbackConfig,
): Promise<Response> {
  const {
    oauthConfig,
    applicationUrl,
    rolesClaim = 'roles',
    sessionDurationDays = 7,
    defaultRedirectPath = '/',
    validateReturnTo,
  } = config;

  // 1) Rate limit
  if (!(await globalGETRateLimit())) {
    logger.warn('Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  try {
    // 2) Reconstruct the public callback URL
    const currentUrl = new URL(request.url);
    const publicUrl = new URL(applicationUrl);
    publicUrl.search = currentUrl.search;

    // 3) Read PKCE cookies
    const storedState = await getAuthCookie('oauth_state');
    const storedCodeVerifier = await getAuthCookie('oauth_code_verifier');

    if (!storedState || !storedCodeVerifier) {
      logger.warn('Missing state or code verifier');
      return new Response('Please restart the login process.', { status: 400 });
    }

    // 4) Exchange code for tokens (generic OIDC logic in fides-auth)
    const tokens = await exchangeAuthorizationCode(
      oauthConfig,
      publicUrl,
      storedCodeVerifier,
      storedState,
    );

    // 5) Build session from tokens and persist
    const session = buildSessionFromTokens(tokens, rolesClaim);
    const jwt = await createSession(session, { sessionDurationDays });
    await setSessionCookie(jwt);

    // 7) Clean up PKCE & returnTo cookies
    const returnTo = await getAuthCookie('returnTo');
    await deleteAuthCookies(['oauth_state', 'oauth_code_verifier', 'returnTo']);

    // 8) Build safe redirect URL (generic validation in fides-auth)
    const redirectUrl = validateReturnUrl(
      returnTo,
      applicationUrl,
      defaultRedirectPath,
      validateReturnTo,
    );
    redirectUrl.searchParams.set('login', 'success');

    logger.info({ redirectUrl: redirectUrl.toString() }, 'Login successful, redirecting');

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  } catch (error) {
    logger.error({ error }, 'OIDC callback error');
    return new Response('An unexpected error occurred. Please restart the login process.', {
      status: 500,
    });
  }
}

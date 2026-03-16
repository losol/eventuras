/**
 * Generic OIDC login initiation handler for Next.js route handlers.
 *
 * Builds PKCE parameters, persists them in cookies, and redirects
 * to the OIDC provider's authorization endpoint.
 */

import type { OAuthConfig } from '@eventuras/fides-auth/oauth';
import {
  buildPKCEOptions,
  discoverAndBuildAuthorizationUrl,
} from '@eventuras/fides-auth/oauth';
import { Logger } from '@eventuras/logger';
import { cookies } from 'next/headers';

import { defaultOAuthCookieOptions } from './cookies';
import { globalGETRateLimit } from './request';

const logger = Logger.create({ namespace: 'fides-auth-next:oidc-login' });

export interface OidcLoginConfig {
  /** OAuth/OIDC configuration */
  oauthConfig: OAuthConfig;

  /**
   * Validates and sanitizes the returnTo parameter.
   * Should return a safe path or null to use the default.
   * @default Only allows relative paths starting with /
   */
  validateReturnTo?: (rawReturnTo: string) => string | null;
}

const defaultValidateReturnTo = (raw: string): string | null =>
  /^\/(?!\/)/.test(raw) ? raw : null;

/**
 * Handles OIDC login initiation in a Next.js route handler.
 *
 * @example
 * ```ts
 * // In app/api/auth/login/route.ts
 * import { handleOidcLogin } from '@eventuras/fides-auth-next/oidc-login';
 *
 * export async function GET(request: Request) {
 *   return handleOidcLogin(request, { oauthConfig });
 * }
 * ```
 */
export async function handleOidcLogin(
  request: Request,
  config: OidcLoginConfig,
): Promise<Response> {
  const { oauthConfig, validateReturnTo = defaultValidateReturnTo } = config;

  if (!(await globalGETRateLimit())) {
    logger.warn('Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  // Validate returnTo parameter
  const url = new URL(request.url);
  const rawReturnTo = url.searchParams.get('returnTo');
  const returnTo = rawReturnTo ? validateReturnTo(rawReturnTo) : null;

  // Build PKCE & authorization URL
  const pkce = await buildPKCEOptions(oauthConfig);
  const authorizationUrl = await discoverAndBuildAuthorizationUrl(oauthConfig, pkce);

  logger.info('Redirecting to OIDC provider for login');

  // Persist PKCE state in cookies using Next.js cookies API
  const cookieStore = await cookies();
  const cookieOpts = defaultOAuthCookieOptions;

  cookieStore.set('oauth_state', pkce.state, cookieOpts);
  cookieStore.set('oauth_code_verifier', pkce.code_verifier, cookieOpts);

  if (returnTo) {
    cookieStore.set('returnTo', returnTo, cookieOpts);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: authorizationUrl.toString() },
  });
}

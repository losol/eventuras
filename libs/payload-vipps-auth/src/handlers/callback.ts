/**
 * Vipps Callback Handler - Handles OAuth callback
 */

import { Logger } from '@eventuras/logger';
import { VippsLoginClient, getVippsIssuer, type VippsUserInfo } from '@eventuras/fides-auth/providers/vipps';
import type { Payload } from 'payload';
import { VIPPS_SESSION_PENDING_COOKIE } from '../strategy';
import type { ResolvedVippsAuthConfig } from '../types';

const logger = Logger.create({
  namespace: 'payload-vipps-auth:handlers',
  context: { module: 'CallbackHandler' },
});

function withSetCookie(response: Response, setCookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', setCookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getCookieValue(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=');
    if (!rawName) continue;
    if (rawName === name) {
      const rawValue = rest.join('=');
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }

  return undefined;
}

function clearCookieHeader(cookieName: string, isSecure: boolean): string {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? '; Secure' : ''}`;
}

/**
 * Default mapping from Vipps user to Payload user fields
 */
function defaultMapVippsUser(vippsUser: VippsUserInfo): Partial<any> {
  return {
    email: vippsUser.email,
    email_verified: vippsUser.email_verified,
    given_name: vippsUser.given_name,
    family_name: vippsUser.family_name,
    phone_number: vippsUser.phone_number,
    phone_number_verified: vippsUser.phone_number_verified,
  };
}

/**
 * Handle Vipps OAuth callback
 * Exchanges code for tokens, gets user info, creates/updates user, and logs in via Payload
 *
 * @param request - Next.js request object
 * @param config - Vipps authentication configuration
 * @param payload - Payload CMS instance
 * @returns Response with redirect and Payload session
 */
export async function handleVippsCallback(
  request: Request,
  config: ResolvedVippsAuthConfig,
  payload: Payload
): Promise<Response> {
  logger.info('Handling Vipps callback');

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Compute redirect URI from request if not explicitly configured
    const pkceCookieName = state ? `vipps_pkce_${state}` : undefined;
    const redirectCookieName = state ? `vipps_redirect_${state}` : undefined;
    const isSecure = url.protocol === 'https:';

    const redirectUriFromCookie = redirectCookieName ? getCookieValue(request, redirectCookieName) : undefined;
    const redirectUri = redirectUriFromCookie || config.redirectUri || `${url.origin}/api/auth/vipps/callback`;

    const appendClearPkceCookie = (response: Response, cookieName?: string) => {
      if (!cookieName) return response;
      return withSetCookie(
        response,
        clearCookieHeader(cookieName, isSecure)
      );
    };

    const appendClearRedirectCookie = (response: Response, cookieName?: string) => {
      if (!cookieName) return response;
      return withSetCookie(response, clearCookieHeader(cookieName, isSecure));
    };

    // Check for OAuth errors
    if (error) {
      logger.error({ error, description: url.searchParams.get('error_description') }, 'OAuth error');
      return Response.redirect(new URL('/admin/login?error=oauth_failed', url.origin));
    }

    if (!code || !state) {
      logger.error('Missing code or state parameter');
      return Response.redirect(new URL('/admin/login?error=invalid_callback', url.origin));
    }

    // Retrieve code verifier
    const pkceCookieNameToClear = pkceCookieName;
    const redirectCookieNameToClear = redirectCookieName;

    const codeVerifier = pkceCookieNameToClear ? getCookieValue(request, pkceCookieNameToClear) : undefined;
    if (codeVerifier) {
      logger.info({ state }, 'Using PKCE code verifier from cookie');
    }

    if (!codeVerifier) {
      logger.error({ state }, 'Invalid or expired state');
      const response = Response.redirect(new URL('/admin/login?error=invalid_state', url.origin));
      return appendClearRedirectCookie(appendClearPkceCookie(response, pkceCookieNameToClear), redirectCookieNameToClear);
    }

    // Initialize Vipps client
    const client = new VippsLoginClient({
      issuer: getVippsIssuer(config.apiUrl),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri,
      scope: config.scope,
      subscriptionKey: config.subscriptionKey,
      merchantSerialNumber: config.merchantSerialNumber,
    });

    // Exchange code for tokens
    logger.debug('Exchanging authorization code for tokens');
    // Important: `request.url` may be an internal origin (e.g. localhost) when running behind
    // a reverse proxy/tunnel. Some OAuth libraries derive `redirect_uri` from the callback URL.
    // Ensure the callback URL we pass matches the *public* redirectUri exactly.
    const callbackUrl = new URL(redirectUri);
    callbackUrl.search = url.search;

    const tokens = await client.exchangeCodeForTokens(callbackUrl, codeVerifier, state);

    if (!tokens.access_token) {
      logger.error('No access token received');
      const response = Response.redirect(new URL('/admin/login?error=token_failed', url.origin));
      return appendClearRedirectCookie(appendClearPkceCookie(response, pkceCookieNameToClear), redirectCookieNameToClear);
    }

    // Get user info from Vipps
    logger.debug('Fetching user info from Vipps');
    const vippsUser = await client.getUserInfo(tokens.access_token);

    if (!vippsUser.email) {
      logger.error({ sub: vippsUser.sub }, 'Vipps user has no email');
      const response = Response.redirect(new URL('/admin/login?error=no_email', url.origin));
      return appendClearRedirectCookie(appendClearPkceCookie(response, pkceCookieNameToClear), redirectCookieNameToClear);
    }

    // Find or create user in Payload
    logger.debug({ email: vippsUser.email }, 'Finding or creating user');

    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: vippsUser.email,
        },
      },
      limit: 1,
    });

    let user;
    if (users.docs.length > 0) {
      // Update existing user
      user = users.docs[0];
      logger.info({ userId: user?.id, email: user?.email }, 'Found existing user');

      // Optionally update user data from Vipps
      const mapFn = config.mapVippsUser || defaultMapVippsUser;
      const updates = mapFn(vippsUser);

      if (Object.keys(updates).length > 0) {
        user = await payload.update({
          collection: 'users',
          id: user?.id || '',
          data: updates,
        });
        logger.debug({ userId: user.id }, 'Updated user with Vipps data');
      }
    } else {
      // Create new user
      const mapFn = config.mapVippsUser || defaultMapVippsUser;
      const userData = mapFn(vippsUser);

      user = await payload.create({
        collection: 'users',
        data: {
          email: vippsUser.email!,
          ...userData,
        },
      });

      logger.info({ userId: user.id, email: user.email }, 'Created new user from Vipps');
    }

    if (!user) {
      logger.error('Failed to create or find user');
      const response = Response.redirect(new URL('/admin/login?error=user_creation_failed', url.origin));
      return appendClearRedirectCookie(appendClearPkceCookie(response, pkceCookieNameToClear), redirectCookieNameToClear);
    }

    // Create encrypted session cookie with Vipps user data for the strategy to pick up
    // The strategy will decrypt this, find the user by email, and Payload handles the JWT session
    const { createEncryptedJWT } = await import('@eventuras/fides-auth/utils');
    const sessionToken = await createEncryptedJWT({
      user: {
        email: user.email,
        id: user.id,
        // Store additional Vipps data in case we need it
        vipps: {
          email_verified: vippsUser.email_verified,
          phone_number: vippsUser.phone_number,
          given_name: vippsUser.given_name,
          family_name: vippsUser.family_name,
        },
      },
    });

    // Set encrypted session cookie (60 second TTL, just for the OAuth handshake)
    const vippsSessionCookie = `${VIPPS_SESSION_PENDING_COOKIE}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60${isSecure ? '; Secure' : ''}`;

    logger.info({ userId: user?.id, email: user?.email }, 'Vipps login successful, redirecting to session endpoint');

    // Redirect to session endpoint which will authenticate via the strategy and create Payload JWT session
    // Use the redirectUri origin to ensure we redirect to the correct domain
    const sessionUrl = new URL('/api/auth/vipps/session', new URL(redirectUri).origin);

    let response = new Response(null, {
      status: 302,
      headers: {
        'Location': sessionUrl.toString(),
      },
    });

    // Add all cookies
    response = withSetCookie(response, vippsSessionCookie);

    return appendClearRedirectCookie(appendClearPkceCookie(response, pkceCookieNameToClear), redirectCookieNameToClear);
  } catch (error) {
    logger.error({ error }, 'Failed to handle Vipps callback');
    const url = new URL(request.url);
    return Response.redirect(new URL('/admin/login?error=callback_failed', url.origin));
  }
}

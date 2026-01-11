/**
 * Vipps OAuth Session Route Handler
 *
 * Triggers Payload auth strategies to create a session from the temporary Vipps auth cookie.
 * This endpoint is called after the OAuth callback to convert the temporary cookie into a Payload JWT session.
 *
 * @example
 * ```typescript
 * // In your Next.js app: app/api/auth/vipps/session/route.ts
 * import { handleVippsSession } from '@eventuras/payload-vipps-auth';
 * import { getPayload } from 'payload';
 * import config from '@payload-config';
 *
 * export async function GET(request: Request) {
 *   const payload = await getPayload({ config });
 *   return handleVippsSession(request, payload, {
 *     adminPath: '/admin',
 *     onError: '/admin/login?error=auth_failed',
 *   });
 * }
 * ```
 */

import crypto from 'crypto';

import type { Payload } from 'payload';
import { generatePayloadCookie, jwtSign } from 'payload';

export interface VippsSessionOptions {
  /**
   * Path to redirect to after successful authentication
   * @default '/admin'
   */
  adminPath?: string;

  /**
   * Path to redirect to on authentication failure
   * @default '/admin/login?error=auth_failed'
   */
  onError?: string;

  /**
   * Function to determine the public origin (useful for proxied environments)
   */
  getOrigin?: (request: Request) => string;
}

/**
 * Handle Vipps session creation
 *
 * This handler:
 * 1. Calls Payload's auth to run strategies (including Vipps)
 * 2. Manually generates JWT with session ID
 * 3. Manually generates Payload cookie
 * 4. Redirects to admin with the authentication cookie
 */
export async function handleVippsSession(
  request: Request,
  payload: Payload,
  options: VippsSessionOptions = {},
): Promise<Response> {
  const { adminPath = '/admin', onError = '/admin/login?error=auth_failed', getOrigin } = options;

  // Determine origin
  const origin = getOrigin ? getOrigin(request) : new URL(request.url).origin;

  // Call Payload's auth to run strategies (including Vipps)
  const { user } = await payload.auth({
    headers: request.headers,
  });

  if (!user) {
    // Authentication failed - redirect to login with error
    return Response.redirect(new URL(onError, origin));
  }

  // User authenticated - manually generate JWT and Payload cookie
  const collection = payload.collections['users'];
  if (!collection) {
    throw new Error('Users collection not found');
  }

  const authConfig = collection.config.auth;

  // Generate secret for JWT signing (SHA-256 hash of Payload secret)
  const secret = crypto
    .createHash('sha256')
    .update(payload.config.secret)
    .digest('hex')
    .slice(0, 32);

  // Sign the JWT token with user data and session ID
  const { token } = await jwtSign({
    fieldsToSign: {
      _strategy: (user as any)._strategy ?? undefined,
      collection: 'users',
      email: (user as any).email,
      id: user.id,
      sid: (user as any)._sid ?? undefined,
    },
    secret,
    tokenExpiration: authConfig.tokenExpiration,
  });

  // Generate Payload authentication cookie
  const cookies = generatePayloadCookie({
    collectionAuthConfig: authConfig,
    cookiePrefix: payload.config.cookiePrefix,
    token: token!,
  });

  // Create redirect response with Payload auth cookie
  const headers = new Headers();
  headers.set('Location', new URL(adminPath, origin).toString());
  headers.append('Set-Cookie', cookies);

  return new Response(null, {
    status: 302,
    headers,
  });
}

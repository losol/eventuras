/**
 * Server-side heartbeat handler for Next.js route handlers.
 *
 * Pairs with the client-side `useHeartbeat` hook: when the user is active, the
 * client POSTs here, and this handler exchanges the current refresh token for
 * a fresh access token (and rotated refresh token, if the IdP rotates).
 *
 * Returns:
 * - 200 with `{ accessTokenExpiresAt }` on success
 * - 401 when there is no session or the refresh token is dead
 * - 405 for non-POST methods
 * - 429 when rate-limited
 */

import { Logger } from '@eventuras/logger';
import type { OAuthConfig } from '@eventuras/fides-auth/oauth';
import { getCurrentSession, refreshCurrentSession } from './session';
import { globalPOSTRateLimit } from './request';

const logger = Logger.create({ namespace: 'fides-auth-next:heartbeat' });

export interface HeartbeatHandlerConfig {
  /** OAuth/OIDC configuration used to refresh the access token. */
  oauthConfig: OAuthConfig;
}

/**
 * Handles a heartbeat request — refresh the active session if there is one.
 *
 * @example
 * ```ts
 * // app/(auth)/api/auth/heartbeat/route.ts
 * import { handleHeartbeat } from '@eventuras/fides-auth-next/heartbeat-handler';
 * import { oauthConfig } from '@/utils/oauthConfig';
 *
 * export async function POST(request: Request) {
 *   return handleHeartbeat(request, { oauthConfig });
 * }
 * ```
 */
export async function handleHeartbeat(
  request: Request,
  config: HeartbeatHandlerConfig,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  if (!(await globalPOSTRateLimit())) {
    logger.warn('Heartbeat rate limit exceeded');
    return new Response(null, { status: 429 });
  }

  const session = await getCurrentSession();
  if (!session) {
    logger.debug('Heartbeat with no session');
    return new Response(null, { status: 401 });
  }

  if (!session.tokens?.refreshToken) {
    logger.warn('Heartbeat with session but no refresh token');
    return new Response(null, { status: 401 });
  }

  const updated = await refreshCurrentSession(config.oauthConfig);
  if (!updated) {
    // Refresh failed — most likely invalid_grant (refresh token expired).
    logger.info('Heartbeat refresh failed');
    return new Response(null, { status: 401 });
  }

  logger.debug('Heartbeat refresh succeeded');
  return Response.json(
    {
      accessTokenExpiresAt: updated.tokens?.accessTokenExpiresAt ?? null,
    },
    {
      // Auth/session endpoint — must never be cached by the browser or any
      // intermediary, or a stale 200 could fool the client into thinking a
      // refresh succeeded without actually hitting the server.
      headers: { 'Cache-Control': 'private, no-store' },
    },
  );
}

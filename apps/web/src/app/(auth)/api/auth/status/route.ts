import { accessTokenExpires, tryGetCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import type { AuthStatus } from '@/utils/auth/getAuthStatus';

const logger = Logger.create({ namespace: 'web:api:auth:status' });

const noStore = { 'Cache-Control': 'private, no-store' };

function notAuthenticated(status = 200): Response {
  return Response.json({ authenticated: false } satisfies AuthStatus, {
    status,
    headers: noStore,
  });
}

/**
 * Reports whether the user is logged in — not whether the access token is
 * fresh. Expired-but-refreshable still counts as authenticated; the heartbeat
 * refreshes it.
 */
export async function GET(): Promise<Response> {
  try {
    const { session, reason } = await tryGetCurrentSession();

    if (!session?.user) {
      // no_session_cookie is the ordinary anonymous case — not worth a line.
      if (reason && reason !== 'no_session_cookie') {
        logger.warn({ reason }, 'No usable session, reporting logged out');
      }
      return notAuthenticated();
    }

    const { accessToken, refreshToken } = session.tokens ?? {};
    const accessTokenExpired = !!accessToken && accessTokenExpires(accessToken, 0);

    if (accessTokenExpired && !refreshToken) {
      logger.warn(
        { sid: session.sid },
        'Access token expired with no refresh token, reporting logged out'
      );
      return notAuthenticated();
    }

    if (accessTokenExpired) {
      logger.debug(
        { sid: session.sid },
        'Access token expired but refreshable, still authenticated'
      );
    }

    return Response.json(
      {
        authenticated: true,
        user: {
          name: session.user.name ?? '',
          email: session.user.email ?? '',
          roles: session.user.roles ?? [],
        },
      } satisfies AuthStatus,
      { headers: noStore }
    );
  } catch (error) {
    logger.error({ error }, 'Auth status check failed');
    return notAuthenticated(500);
  }
}

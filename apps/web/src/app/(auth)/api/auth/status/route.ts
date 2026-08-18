import { cookies } from 'next/headers';

import { getSessionSecret, validateSessionJwt } from '@eventuras/fides-auth-next';
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
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      return notAuthenticated();
    }

    const { status, session, accessTokenExpiresIn, reason } = await validateSessionJwt(
      sessionCookie,
      getSessionSecret()
    );

    if (status === 'INVALID' || !session?.user) {
      logger.warn({ status, reason }, 'Unusable session cookie, reporting logged out');
      return notAuthenticated();
    }

    if (status === 'EXPIRED' && !session.tokens?.refreshToken) {
      logger.warn(
        { accessTokenExpiresIn },
        'Access token expired with no refresh token, reporting logged out'
      );
      return notAuthenticated();
    }

    if (status === 'EXPIRED') {
      logger.debug(
        { accessTokenExpiresIn },
        'Access token expired but refreshable, still authenticated'
      );
    }

    return Response.json(
      {
        authenticated: true,
        user: {
          name: session.user.name,
          email: session.user.email,
          roles: session.user.roles,
        },
      } satisfies AuthStatus,
      { headers: noStore }
    );
  } catch (error) {
    logger.error({ error }, 'Auth status check failed');
    return notAuthenticated(500);
  }
}

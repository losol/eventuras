import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import type { AuthStatus } from '@/utils/auth/getAuthStatus';

const logger = Logger.create({ namespace: 'web:api:auth:status' });

export async function GET(): Promise<Response> {
  try {
    const session = await getCurrentSession();

    if (!session?.user || !session?.tokens?.accessToken) {
      return Response.json({ authenticated: false } satisfies AuthStatus, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
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
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    logger.error({ error }, 'Auth status check failed');
    return Response.json({ authenticated: false } satisfies AuthStatus, {
      status: 500,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}

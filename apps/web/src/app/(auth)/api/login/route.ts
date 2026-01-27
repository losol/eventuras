import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { accessTokenExpires, getCurrentSession } from '@eventuras/fides-auth-next';
import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { Logger } from '@eventuras/logger';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:api:login' });

export async function GET() {
  logger.info('Starting login flow');

  try {
    const rateLimitOk = await globalGETRateLimit();
    if (!rateLimitOk) {
      logger.warn('Rate limit exceeded');
      return NextResponse.redirect(
        new URL('/rate-limited', process.env.NEXT_PUBLIC_APPLICATION_URL)
      );
    }

    logger.debug('Checking for existing session');
    const session = await getCurrentSession(oauthConfig);

    if (session !== null) {
      // Check if the session is actually valid (access token not expired and refresh token exists)
      const tokenExpired = session.tokens?.accessToken
        ? accessTokenExpires(session.tokens.accessToken, 10)
        : true;

      const hasRefreshToken = !!session.tokens?.refreshToken;

      if (!tokenExpired && hasRefreshToken) {
        // Valid session exists, redirect to the homepage
        logger.info(
          {
            user: session.user?.email,
          },
          'Valid session exists, redirecting to homepage'
        );
        return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APPLICATION_URL));
      } else {
        // Session exists but is invalid/expired - clear it
        logger.info('Session expired or invalid, clearing and proceeding to Auth0');
        (await cookies()).delete('session');
      }
    }

    logger.info('No session found, redirecting to Auth0');

    // If no session exists, redirect to the Auth0 login page
    return NextResponse.redirect(
      new URL('/api/login/auth0', process.env.NEXT_PUBLIC_APPLICATION_URL)
    );
  } catch (error) {
    logger.error({ error }, 'Error in login route');
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

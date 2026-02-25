import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';

const logger = Logger.create({ namespace: 'web:api:logout' });

export async function GET() {
  logger.info('Logout request received');

  try {
    const applicationUrl = appConfig.env.APPLICATION_URL as string;
    // Rate limiting
    const rateLimitOk = await globalGETRateLimit();
    if (!rateLimitOk) {
      logger.warn('Rate limit exceeded');
      return NextResponse.redirect(new URL('/rate-limited', applicationUrl));
    }

    // Clear the session cookie
    (await cookies()).delete('session');
    logger.info('Session cookie cleared');

    // Redirect to the configured logout URL or homepage
    const redirectUrl = (appConfig.env.LOGOUT_URL_REDIRECT as string) || '/';
    logger.info({ redirectUrl }, 'Redirecting after logout');

    return NextResponse.redirect(new URL(redirectUrl, applicationUrl));
  } catch (error) {
    logger.error({ error }, 'Error in logout route');
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

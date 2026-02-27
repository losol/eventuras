import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { oauthConfig } from '@/utils/oauthConfig';

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

    // Redirect to Auth0's logout endpoint to clear the Auth0 SSO session.
    // Without this, Auth0 will auto-login the user again on the next login attempt.
    const postLogoutRedirect = (appConfig.env.LOGOUT_URL_REDIRECT as string) || '/';
    const postLogoutUrl = new URL(postLogoutRedirect, applicationUrl).toString();

    const auth0LogoutUrl = new URL(`${oauthConfig.issuer}/v2/logout`);
    auth0LogoutUrl.searchParams.set('client_id', oauthConfig.clientId);
    auth0LogoutUrl.searchParams.set('returnTo', postLogoutUrl);

    logger.info(
      { auth0LogoutUrl: auth0LogoutUrl.toString(), postLogoutUrl },
      'Redirecting to Auth0 logout'
    );

    return NextResponse.redirect(auth0LogoutUrl.toString());
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

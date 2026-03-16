import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { buildOidcLogoutUrl } from '@eventuras/fides-auth-next';
import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:api:logout' });

export async function GET() {
  logger.info('Logout request received');

  try {
    const applicationUrl = appConfig.env.APPLICATION_URL as string;

    if (!(await globalGETRateLimit())) {
      logger.warn('Rate limit exceeded');
      return NextResponse.redirect(new URL('/rate-limited', applicationUrl));
    }

    (await cookies()).delete('session');

    const postLogoutRedirect = (appConfig.env.LOGOUT_URL_REDIRECT as string) || '/';
    const postLogoutUrl = new URL(postLogoutRedirect, applicationUrl).toString();

    const logoutUrl = await buildOidcLogoutUrl(oauthConfig, postLogoutUrl);

    if (logoutUrl) {
      logger.info({ logoutUrl: logoutUrl.toString() }, 'Redirecting to OIDC provider logout');
      return NextResponse.redirect(logoutUrl.toString());
    }

    logger.info({ postLogoutUrl }, 'No end_session_endpoint, redirecting to app');
    return NextResponse.redirect(postLogoutUrl);
  } catch (error) {
    logger.error({ error }, 'Error in logout route');
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

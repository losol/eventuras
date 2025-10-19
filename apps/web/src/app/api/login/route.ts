import {globalGETRateLimit} from '@eventuras/fides-auth-next/request';
import {getCurrentSession} from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';
import { NextResponse } from 'next/server';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:api:login' });

export async function GET() {
  console.log('[LOGIN] Starting login flow');
  logger.info('Starting login flow');

  try {
    console.log('[LOGIN] Checking rate limit');
    const rateLimitOk = await globalGETRateLimit();
    if (!rateLimitOk) {
      console.log('[LOGIN] Rate limit exceeded');
      logger.warn('Rate limit exceeded');
      return NextResponse.redirect(new URL('/rate-limited', process.env.NEXT_PUBLIC_APPLICATION_URL));
    }
    console.log('[LOGIN] Rate limit OK');

    console.log('[LOGIN] Checking for existing session');
    logger.debug('Checking for existing session');
    const session = await getCurrentSession(oauthConfig);

    if (session !== null) {
      // If a session exists, redirect to the homepage
      console.log('[LOGIN] Session exists, redirecting to homepage', {
        user: session.user?.email,
        expiresAt: session.expiresAt
      });
      logger.info({
        user: session.user?.email,
        expiresAt: session.expiresAt
      }, 'Session exists, redirecting to homepage');
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APPLICATION_URL));
    }

    console.log('[LOGIN] No session found, redirecting to Auth0');
    logger.info('No session found, redirecting to Auth0');

    // If no session exists, redirect to the Auth0 login page
    return NextResponse.redirect(
      new URL('/api/login/auth0', process.env.NEXT_PUBLIC_APPLICATION_URL)
    );
  } catch (error) {
    console.error('[LOGIN] Error in login route:', error);
    logger.error({ error }, 'Error in login route');
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
}

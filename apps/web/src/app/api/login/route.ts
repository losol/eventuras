import {globalGETRateLimit} from '@eventuras/fides-auth-next/request';
import {getCurrentSession} from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';
import { NextResponse } from 'next/server';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:api:login' });

export async function GET() {
  try {
    const rateLimitOk = await globalGETRateLimit();
    if (!rateLimitOk) {
      return NextResponse.redirect(new URL('/rate-limited', process.env.NEXT_PUBLIC_APPLICATION_URL));
    }

    const session = await getCurrentSession(oauthConfig);
    if (session !== null) {
      // If a session exists, redirect to the homepage
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APPLICATION_URL));
    }

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
      }
    });
  }
}

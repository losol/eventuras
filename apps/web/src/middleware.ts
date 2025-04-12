import { refreshSession } from '@eventuras/fides-auth/session-refresh';
import { validateSessionJwt } from '@eventuras/fides-auth/session-validation';
import { accessTokenExpires, createEncryptedJWT } from '@eventuras/fides-auth/utils';
import { Logger } from '@eventuras/utils/src/Logger';
import { NextRequest, NextResponse } from 'next/server';

import { oauthConfig } from './utils/oauthConfig';

export async function middleware(request: NextRequest) {
  if (request.method === 'GET') {
    const response = NextResponse.next();
    const sessioncookie = request.cookies.get('session')?.value ?? null;

    if (sessioncookie !== null) {
      const session = await validateSessionJwt(sessioncookie);

      if (session.status === 'INVALID') {
        response.cookies.delete('session');
        return response;
      }

      const accessToken = session.session?.tokens?.accessToken;
      if (session.session && accessToken) {
        if (accessTokenExpires(accessToken)) {
          Logger.info(
            { namespace: 'eventuras:middleware' },
            'Access token expiring soon, refreshing session...'
          );
          const updated_session = await refreshSession(session.session, oauthConfig);

          const encrypted_jwt = await createEncryptedJWT(updated_session);
          response.cookies.set('session', encrypted_jwt, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        }
      }
      return response;
    }
  }

  // For non-GET requests, validate headers
  const originHeader = request.headers.get('Origin');
  const hostHeader = request.headers.get('Host');
  const forwardedHost = request.headers.get('X-Forwarded-Host');

  if (!originHeader || (!hostHeader && !forwardedHost)) {
    return new NextResponse(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    Logger.error({ namespace: 'eventuras:middleware' }, 'Invalid Origin header:', originHeader);
    return new NextResponse(null, { status: 403 });
  }

  if (hostHeader !== origin.host && forwardedHost !== origin.host) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};

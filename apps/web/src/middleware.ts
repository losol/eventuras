import { refreshAccesstoken } from '@eventuras/fides-auth/oauth';
import { validateSessionJwt } from '@eventuras/fides-auth/session-validation';
import { createEncryptedJWT } from '@eventuras/fides-auth/utils';
import { Logger } from '@eventuras/utils/src/Logger';
import { NextRequest, NextResponse } from 'next/server';

import { authConfig } from './utils/authconfig';

export async function middleware(request: NextRequest) {
  if (request.method === 'GET') {
    const response = NextResponse.next();
    const sessioncookie = request.cookies.get('session')?.value ?? null;

    if (sessioncookie !== null) {
      let session;
      try {
        session = await validateSessionJwt(sessioncookie);
      } catch (error) {
        Logger.error(
          { namespace: 'eventuras:middleware' },
          'Error during session validation:',
          error
        );
        return response;
      }

      if (session.status === 'INVALID') {
        response.cookies.delete('session');
        return response;
      }

      if (session.session?.tokens?.accessTokenExpiresAt) {
        console.log('mw-checking expiration', session.session.tokens.accessTokenExpiresAt);
        const accessTokenExpiresAt =
          session.session.tokens.accessTokenExpiresAt instanceof Date
            ? session.session.tokens.accessTokenExpiresAt
            : new Date(session.session.tokens.accessTokenExpiresAt);

        const remainingSeconds = (accessTokenExpiresAt.getTime() - Date.now()) / 1000;
        const refreshThresholdSeconds = 300;

        if (remainingSeconds < refreshThresholdSeconds && session.session.tokens?.refreshToken) {
          try {
            const newtokens = await refreshAccesstoken(
              authConfig.issuer,
              session.session.tokens.refreshToken,
              authConfig.clientId,
              authConfig.clientSecret
            );

            const updatedSession = {
              ...session.session,
              tokens: {
                ...session.session.tokens,
                accessToken: newtokens.access_token,
                accessTokenExpiresAt: newtokens.expires_in
                  ? new Date(Date.now() + newtokens.expires_in * 1000)
                  : undefined,
                refreshToken: newtokens.refresh_token,
              },
            };

            console.log('MW updatedSession', updatedSession);

            const jwt = await createEncryptedJWT(updatedSession);
            response.cookies.set('session', jwt, {
              path: '/',
              maxAge: 60 * 60 * 24 * 30,
              sameSite: 'lax',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            });
          } catch (error) {
            Logger.error(
              { namespace: 'eventuras:middleware' },
              'Error during token refresh:',
              error
            );
            response.cookies.delete('session');
          }
        }
      }
    }
    return response;
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

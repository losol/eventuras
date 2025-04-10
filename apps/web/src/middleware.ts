/**
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * This file is to provide middleware which, through a matcher, will protect specific urls from unauthorized access.
 * This saves individual pages to have to check for authorization.
 */

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
      const session = await validateSessionJwt(sessioncookie);

      if (session.status === 'INVALID') {
        // Session is invalid, delete the cookie.
        response.cookies.delete('session');
      }

      if (session.session?.tokens?.accessTokenExpiresAt) {
        console.log('mw-checking expiration', session.session.tokens.accessTokenExpiresAt);
        const accessTokenExpiresAt =
          session.session.tokens.accessTokenExpiresAt instanceof Date
            ? session.session.tokens.accessTokenExpiresAt
            : new Date(session.session.tokens.accessTokenExpiresAt);
        const remainingSeconds = (accessTokenExpiresAt.getTime() - Date.now()) / 1000;
        const refreshThresholdSeconds = 300;
        // If the access token will expire soon, trigger a refresh via the API.
        if (remainingSeconds < refreshThresholdSeconds && session.session.tokens?.refreshToken) {
          // Await the refresh to ensure it completes before continuing.
          const newtokens = await refreshAccesstoken(
            authConfig.issuer,
            session.session.tokens.refreshToken,
            authConfig.clientId,
            authConfig.clientSecret
          );

          // Create a new session with the refreshed tokens.
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

          console.log('MWupdatedSession', updatedSession);

          const jwt = await createEncryptedJWT(updatedSession);
          // Only extend cookie expiration on GET requests since we can be sure
          // a new session wasn't set when handling the request.
          response.cookies.set('session', jwt, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        }
      }
    }
    return response;
  }

  // Check for valid Origin and either Host or X-Forwarded-Host headers on non-GET requests.
  const originHeader = request.headers.get('Origin');
  const hostHeader = request.headers.get('Host');
  const forwardedHost = request.headers.get('X-Forwarded-Host');

  // Both Origin must be present and at least one of Host or X-Forwarded-Host must be provided.
  if (!originHeader || (!hostHeader && !forwardedHost)) {
    return new NextResponse(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    Logger.error({ namespace: 'eventuras:midddleware' }, 'Invalid Origin header:', originHeader);
    return new NextResponse(null, { status: 403 });
  }

  // Test both host headers: allow if either matches the origin host.
  if (hostHeader !== origin.host && forwardedHost !== origin.host) {
    return new NextResponse(null, { status: 403 });
  }
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/user/(events | account)/:path*/'],
};

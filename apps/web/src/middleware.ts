/**
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * This file is to provide middleware which, through a matcher, will protect specific urls from unauthorized access.
 * This saves individual pages to have to check for authorization.
 */

import { Logger } from '@eventuras/utils';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

export async function middleware(request: NextRequest) {
  if (request.method === 'GET') {
    const response = NextResponse.next();
    const token = request.cookies.get('session')?.value ?? null;
    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure
      // a new session wasn't set when handling the request.
      response.cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
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
    return new NextResponse(null, { status: 403 });
  }

  // Test both host headers: allow if either matches the origin host.
  if (hostHeader !== origin.host && forwardedHost !== origin.host) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const token = await getToken({ req: request });
    const requestHeaders = new Headers(request.headers);

    // If the token exists, set it as an Authorization header.
    if (token?.access_token) {
      requestHeaders.set('Authorization', `Bearer ${token.access_token}`);
    } else {
      const loginUrl = new URL('/api/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return the original request with the new headers.
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    Logger.error({ namespace: 'auth' }, 'Error in middleware: ' + error);
    // Optionally, you could return a response here if desired.
  }
}

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
    signOut: '/api/auth/signout',
    error: '/api/auth/error',
  },
});

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/user/(events | account)/:path*/'],
};

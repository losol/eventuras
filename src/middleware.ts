/**
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * This file is to provide middleware which, through a matcher, will protect specific urls from unauthorized access.
 * This saves individual pages to have to check for authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

import Logger from './utils/Logger';

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    const requestHeaders = new Headers(request.headers);

    // If the token exists, set it as an Authorization header
    if (token?.access_token) {
      requestHeaders.set('Authorization', `Bearer ${token.access_token}`);
    } else {
      return NextResponse.redirect('/api/auth/signin');
    }

    // Return the original request with the new headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    Logger.error({ namespace: 'auth' }, 'Error in middleware: ' + error);
  }
}

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
    signOut: '/api/auth/signout',
    error: '/api/auth/error',
  },
});

export const config = { matcher: ['/admin/:path*', '/user/:path*'] };

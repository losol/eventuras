import { refreshSession } from '@eventuras/fides-auth/session-refresh';
import { validateSessionJwt } from '@eventuras/fides-auth/session-validation';
import { accessTokenExpires, createEncryptedJWT } from '@eventuras/fides-auth/utils';
import { Logger } from '@eventuras/utils/src/Logger';
import { NextRequest, NextResponse } from 'next/server';

import { oauthConfig } from './utils/oauthConfig';

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;
  const originUrl = url.origin;

  // ─── 1) If this is *not* a GET, do your CORS/origin checks ─────────────
  if (request.method !== 'GET') {
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

    // after validating headers, just continue
    return NextResponse.next();
  }

  // ─── 2) Only add auth to GETs on /user/* and /admin/* ────────────────────────────
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;
  if (sessionCookie) {
    const { status, session } = await validateSessionJwt(sessionCookie);

    if (status === 'VALID' && session?.tokens?.accessToken) {
      const token = session.tokens.accessToken;

      // 2a) Not expired? Let them through.
      if (!accessTokenExpires(token)) {
        return NextResponse.next();
      }

      // 2b) Expired → try to refresh
      Logger.info({ namespace: 'eventuras:middleware' }, 'Token expired, refreshing…');
      try {
        const updated = await refreshSession(session, oauthConfig);
        const encryptedJwt = await createEncryptedJWT(updated);

        const res = NextResponse.next();
        res.cookies.set('session', encryptedJwt, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
        return res;
      } catch (err) {
        Logger.warn({ namespace: 'eventuras:middleware' }, 'Refresh failed, clearing session', err);

        const res = NextResponse.redirect(
          new URL('/api/login/auth0', originUrl).toString() +
            `?returnTo=${encodeURIComponent(pathname + search)}`
        );
        res.cookies.delete('session');
        return res;
      }
    }
  }

  // ─── 3) No valid session → redirect to login ────────────────────────────
  /* build the return‑to URL */
  const loginUrl = new URL('/api/login/auth0', originUrl);
  loginUrl.searchParams.set('returnTo', pathname + search);

  /* redirect + delete the cookie */
  const res = NextResponse.redirect(loginUrl.toString());
  res.cookies.delete('session');
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};

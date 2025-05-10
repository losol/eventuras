import { oauthConfig } from '@/utils/oauthConfig';
import { getCurrentSession } from '@eventuras/fides-auth/session';
import { refreshSession } from '@eventuras/fides-auth/session-refresh';
import { accessTokenExpires, createEncryptedJWT } from '@eventuras/fides-auth/utils';
import { Logger } from '@eventuras/utils/src/Logger';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const sessionCookie = (await cookies()).get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false });
  }

  const session = await getCurrentSession(oauthConfig);

  if (!session?.tokens?.accessToken) {
    return NextResponse.json({ authenticated: false });
  }

  if (accessTokenExpires(session.tokens.accessToken)) {
    Logger.info({ namespace: 'session:route' }, 'Token expired, refreshing…');

    try {
      const updated = await refreshSession(session, oauthConfig);
      if (!updated) {
        throw new Error('Failed to refresh session');
      }
      const encryptedJwt = await createEncryptedJWT(updated);

      const res = NextResponse.json({
        authenticated: true,
        accessTokenExpiresAt: updated.tokens?.accessTokenExpiresAt,
        user: updated.user,
      });

      res.cookies.set('session', encryptedJwt, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      res.headers.set('Cache-Control', 'no-store');
      return res;
    } catch (err) {
      Logger.warn({ namespace: 'eventuras:middleware' }, 'Refresh failed, clearing session', err);

      const { pathname, search } = new URL(request.url);
      const originUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

      const res = NextResponse.redirect(
        new URL('/api/login/auth0', originUrl).toString() +
          `?returnTo=${encodeURIComponent(pathname + search)}`
      );
      res.cookies.delete('session');
      return res;
    }
  }

  return NextResponse.json({
    authenticated: true,
    accessTokenExpiresAt: session.tokens.accessTokenExpiresAt,
    user: session.user,
  });
}

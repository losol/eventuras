import { createClient } from '@/utils/apiClient';
import { oauthConfig } from '@/utils/oauthConfig';
import { getV3Userprofile, UserDto } from '@eventuras/event-sdk';
import {getCurrentSession} from '@eventuras/fides-auth-next/session';
import {refreshSession, accessTokenExpires, createEncryptedJWT} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type SessionError = {
  source?: 'session' | 'refresh' | 'userProfile' | 'unknown';
  code?: string;
  message: string;
  detail?: string;
};

export type SessionStatus = {
  authenticated: boolean;
  sessionExpired: boolean;
  accessTokenExpiresAt?: Date;
  user?: {
    name?: string;
    roles?: string[];
    [key: string]: unknown;
  };
  userProfile?: UserDto;
  errors?: SessionError[];
};

export async function GET(request: Request) {
  const errors: SessionError[] = [];

  const sessionCookie = (await cookies()).get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false, sessionExpired: true });
  }

  let session = await getCurrentSession(oauthConfig);
  let sessionExpired = false;

  if (!session?.tokens?.accessToken) {
    return NextResponse.json({ authenticated: false, sessionExpired: true });
  }

  if (accessTokenExpires(session.tokens.accessToken)) {
    sessionExpired = true;
    Logger.info({ namespace: 'session:route' }, 'Token expired, refreshing…');

    try {
      const updated = await refreshSession(session, oauthConfig);
      if (!updated) throw new Error('Failed to refresh session');
      const encryptedJwt = await createEncryptedJWT(updated);

      session = updated;

      const res = NextResponse.next();
      res.cookies.set('session', encryptedJwt, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    } catch (err) {
      const message = (err as Error).message ?? 'Unknown error during session refresh';
      errors.push({
        source: 'refresh',
        message: 'Session refresh failed',
        detail: message,
      });

      Logger.warn({ namespace: 'eventuras:middleware' }, message, err);

      const { pathname, search } = new URL(request.url);
      const originUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

      const res = NextResponse.json({
        authenticated: false,
        sessionExpired: true,
        errors,
      });
      res.cookies.delete('session');
      return res;
    }
  }

  let userProfile: UserDto | undefined;

  try {
    const result = await getV3Userprofile({ client: await createClient() });

    if (result.error) {
      errors.push({
        source: 'userProfile',
        message: 'Failed to load user profile',
        detail: result.error.toString() ?? 'userProfile fetch error',
      });
    } else {
      userProfile = result.data;
    }
  } catch (err) {
    errors.push({
      source: 'userProfile',
      message: 'User profile fetch threw an error',
      detail: (err as Error).message,
    });
  }

  const response: SessionStatus = {
    authenticated: true,
    sessionExpired,
    accessTokenExpiresAt: session.tokens?.accessTokenExpiresAt,
    user: session.user,
    ...(userProfile && { userProfile }),
    ...(errors.length > 0 && { errors }),
  };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const errors: SessionError[] = [];

  const sessionCookie = (await cookies()).get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({
      refreshed: false,
      errors: [{ message: 'No session cookie found', source: 'session' }],
    });
  }

  const session = await getCurrentSession(oauthConfig);

  if (!session?.tokens?.refreshToken) {
    return NextResponse.json({
      refreshed: false,
      errors: [{ message: 'No refresh token available', source: 'refresh' }],
    });
  }

  try {
    const updated = await refreshSession(session, oauthConfig);
    if (!updated) throw new Error('Failed to refresh session');
    const encryptedJwt = await createEncryptedJWT(updated);

    const res = NextResponse.json({
      refreshed: true,
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

    return res;
  } catch (err) {
    const message = (err as Error).message ?? 'Unknown error during refresh';
    errors.push({
      source: 'refresh',
      message: 'Session refresh failed',
      detail: message,
    });

    Logger.warn({ namespace: 'eventuras:middleware' }, message, err);

    const res = NextResponse.json({ refreshed: false, errors });
    res.cookies.delete('session');
    return res;
  }
}

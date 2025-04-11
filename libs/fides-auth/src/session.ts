import { cookies } from 'next/headers';
import * as jose from 'jose';
import { cache } from 'react';

import { createEncryptedJWT } from './utils';
import { OAuthConfig, refreshAccesstoken } from './oauth';
import { validateSessionJwt } from './session-validation';
export interface Tokens {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
}

export interface Session {
  expiresAt: Date | string;
  tokens?: Tokens;
  user?: {
    name: string;
    email: string;
    roles?: string[];
  };
}

export interface CreateSessionOptions {
  sessionDurationDays?: number;
  setCookie?: boolean;
}



/**
 * Creates an encrypted JWT containing session data and saves it as a cookie.
 *
 * @param session - Session data (expiresAt, tokens, etc.)
 * @param options - Configuration options (e.g., sessionDurationDays)
 */
export async function createSession(
  session: Session,
  options: CreateSessionOptions = {}
): Promise<string> {
  const { sessionDurationDays = 7, setCookie = true } = options;

  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 60 * 24 * sessionDurationDays);
  if (!session.expiresAt) {
    session.expiresAt = expiresAt.toISOString();
  }

  // Build the JWT payload
  const payload: jose.JWTPayload = {
    ...session,
  };

  // Generate an encrypted JWT (JWE) with jose
  const jwt = await createEncryptedJWT(payload);

  // Store the encrypted JWT (JWE) in an HTTP-only cookie
  if (setCookie) {
    cookies().set('session', jwt, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });
  }

  return jwt;
}


/**
 * Retrieves the current session from the "session" cookie, if any.
 * Uses React server components' cache for performance.
 */
export const getCurrentSession = cache(async (config?: OAuthConfig): Promise<Session | null> => {
  const sessionCookie = cookies().get('session')?.value ?? null;

  if (!sessionCookie) {
    return null;
  }

  const sessionjwt = await validateSessionJwt(sessionCookie);

  console.log('sessionvalidation', sessionjwt);

  if (sessionjwt.status !== 'VALID') {
    return null;
  }

  console.log(sessionjwt.accessTokenExpiresIn);

  if (sessionjwt.accessTokenExpiresIn !== undefined && sessionjwt.accessTokenExpiresIn < 300) {
    console.warn('Access token will expire soon – consider refreshing. Seconds left:', sessionjwt.accessTokenExpiresIn);

  }
  if (sessionjwt.session) {
    // If the session is valid, return it
    return sessionjwt.session;
  }

  return null;
});

/**
 * Deletes the session cookie (stateless invalidation).
 */
export function deleteSessionCookie(): void {
  cookies().set('session', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
}

export const refreshSession = async (current_session: Session, config: OAuthConfig, options: CreateSessionOptions = {}): Promise<Session | null> => {
  const { sessionDurationDays = 7, setCookie = true } = options;

  const newtokens = await refreshAccesstoken(config.issuer,
    current_session.tokens?.refreshToken ?? '',
    config.clientId,
    config.clientSecret
  );
  console.log('newtokens', newtokens);

  const updatedSession = {
    ...current_session,
    tokens: {
      ...current_session.tokens,
      accessToken: newtokens.access_token,
      accessTokenExpiresAt: newtokens.expires_in
        ? new Date(Date.now() + newtokens.expires_in * 1000)
        : undefined,
      refreshToken: newtokens.refresh_token ?? current_session.tokens?.refreshToken,
    },
  };

  console.log('updatedSession', updatedSession);

  if (setCookie) {
    deleteSessionCookie();
    await createSession(updatedSession, {
      sessionDurationDays,
      setCookie,
    });
  }

  return updatedSession;
};

import { cookies } from 'next/headers';
import * as jose from 'jose';
import { cache } from 'react';

import { getSessionSecret } from './utils';

export interface Session {
  expiresAt: Date | string;
  accessToken?: string;
  refreshToken?: string;
}

export interface CreateSessionOptions {
  sessionDurationDays?: number;
}

/**
 * Result type after validating or retrieving the session.
 */
export type SessionValidationResult =
  | { session: Session; }
  | { session: null; };

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
  const { sessionDurationDays = 7 } = options;
  const secret = Buffer.from(getSessionSecret(), "hex");

  // Calculate an expiration if the caller hasn't already set it
  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 60 * 24 * sessionDurationDays);
  if (!session.expiresAt) {
    session.expiresAt = expiresAt.toISOString();
  }

  // Build the JWT payload
  const payload: jose.JWTPayload = {
    session,
  };

  // Generate an encrypted JWT (JWE) with jose
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationDays}d`)
    .encrypt(secret);

  // Store the encrypted JWT (JWE) in an HTTP-only cookie
  cookies().set('session', jwt, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });

  return jwt;
}

/**
 * Validates and decrypts the encrypted JWT (JWE) from a given token string.
 *
 * @param token - The encrypted JWT (JWE) string.
 * @returns A SessionValidationResult with the session or null if invalid.
 */
export async function validateSessionTokenCookie(token: string): Promise<SessionValidationResult> {
  const secret = Buffer.from(getSessionSecret(), "hex");

  try {
    const { payload } = await jose.jwtDecrypt(token, secret);
    const session = payload.session as Session;

    // Check expiresAt in the session payload
    if (session?.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      return { session: null };
    }

    // If valid, return the session
    return { session };
  } catch (error) {
    console.error('Cookie token validation failed:', error);
    return { session: null };
  }
}

/**
 * Retrieves the current session from the "session" cookie, if any.
 * Uses React server components' cache for performance.
 */
export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const token = cookies().get('session')?.value ?? null;
  if (!token) {
    return { session: null };
  }
  return await validateSessionTokenCookie(token);
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

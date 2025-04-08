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
    ...session,
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
export async function validateSessionCookie(jwt: string): Promise<Session | null> {
  const secret = Buffer.from(getSessionSecret(), "hex");

  try {
    const { payload } = await jose.jwtDecrypt(jwt, secret);

    // Cast payload to unknown first, then validate its structure
    const sessionPayload = payload as unknown;

    // Validate that the payload contains the required properties
    if (
      typeof sessionPayload === 'object' &&
      sessionPayload !== null &&
      typeof (sessionPayload as any).expiresAt === 'string' &&
      (!('accessToken' in sessionPayload) || typeof (sessionPayload as any).accessToken === 'string') &&
      (!('refreshToken' in sessionPayload) || typeof (sessionPayload as any).refreshToken === 'string')
    ) {
      // Check if the session has expired
      if (new Date((sessionPayload as any).expiresAt).getTime() < Date.now()) {
        deleteSessionCookie(); // Delete the cookie if the session has expired
        return null;
      }

      // Cast the validated payload to the Session type
      return sessionPayload as Session;
    } else {
      console.error('Invalid session payload structure:', payload);
      deleteSessionCookie(); // Delete the cookie if the structure is invalid
      return null;
    }
  } catch (error) {
    console.error('Cookie token validation failed:', error);
    deleteSessionCookie(); // Delete the cookie if decryption fails
    return null;
  }
}

/**
 * Retrieves the current session from the "session" cookie, if any.
 * Uses React server components' cache for performance.
 */
export const getCurrentSession = cache(async (): Promise<Session | null> => {
  const sessionCookie = cookies().get('session')?.value ?? null;

  if (!sessionCookie) {
    return null;
  }

  return await validateSessionCookie(sessionCookie);
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

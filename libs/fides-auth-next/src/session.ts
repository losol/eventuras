import { cookies } from 'next/headers';
import {createEncryptedJWT} from '@eventuras/fides-auth/utils';
import {validateSessionJwt} from '@eventuras/fides-auth/session-validation';
import type {Session, CreateSessionOptions} from '@eventuras/fides-auth/types';
import type {OAuthConfig} from '@eventuras/fides-auth/oauth';
import { cache } from 'react';

/**
 * Creates an encrypted JWT containing session data.
 *
 * @param session - Session data (expiresAt, tokens, etc.)
 * @param options - Configuration options (e.g., sessionDurationDays)
 */
export async function createSession(
  session: Session,
  options: CreateSessionOptions = {}
): Promise<string> {
  const { sessionDurationDays = 7 } = options;

  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 60 * 24 * sessionDurationDays);
  if (!session.expiresAt) {
    session.expiresAt = expiresAt.toISOString();
  }

  // Build the JWT payload and encrypt
  const jwt = await createEncryptedJWT({...session});
  return jwt;
}

/**
 * Retrieves the current session from the "session" cookie, if any.
 * Uses React server components' cache for performance.
 */
export const getCurrentSession = cache(async (config?: OAuthConfig): Promise<Session | null> => {
  const sessionCookie = (await cookies()).get('session')?.value ?? null;

  if (!sessionCookie) {
    return null;
  }

  const sessionjwt = await validateSessionJwt(sessionCookie);

  if (sessionjwt.status !== 'VALID') {
    return null;
  }

  if (sessionjwt.session) {
    return sessionjwt.session;
  }

  return null;
});

import { cookies } from 'next/headers';
import {createEncryptedJWT} from '@eventuras/fides-auth/utils';
import {validateSessionJwt} from '@eventuras/fides-auth/session-validation';
import type {Session, CreateSessionOptions} from '@eventuras/fides-auth/types';
import type {OAuthConfig} from '@eventuras/fides-auth/oauth';
import { Logger } from '@eventuras/logger';
import { cache } from 'react';

const logger = Logger.create({ namespace: 'fides-auth-next:session' });

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
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value ?? null;

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
  } catch (error) {
    // Worker thread errors should not crash the application
    if (error instanceof Error && error.message.includes('worker')) {
      logger.error({ error }, 'Worker thread error in getCurrentSession');
    } else {
      logger.error({ error }, 'Unexpected error in getCurrentSession');
    }
    return null;
  }
});

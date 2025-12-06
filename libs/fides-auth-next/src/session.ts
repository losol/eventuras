import { createEncryptedJWT } from '@eventuras/fides-auth/utils';
import { validateSessionJwt } from '@eventuras/fides-auth/session-validation';
import { refreshSession as refreshSessionCore } from '@eventuras/fides-auth/session-refresh';
import type { Session, CreateSessionOptions } from '@eventuras/fides-auth/types';
import type { OAuthConfig } from '@eventuras/fides-auth/oauth';
import { Logger } from '@eventuras/logger';
import { cache } from 'react';
import { getSessionCookie, setSessionCookie, deleteSessionCookie } from './cookies';

const logger = Logger.create({ namespace: 'fides-auth-next:session' });

/**
 * Creates an encrypted JWT containing session data.
 *
 * @param session - Session data (tokens, user, etc.)
 * @param options - Configuration options (e.g., sessionDurationDays)
 * @returns Encrypted JWT string
 *
 * @example
 * ```ts
 * const jwt = await createSession({
 *   tokens: {
 *     accessToken: 'token',
 *     refreshToken: 'refresh',
 *   },
 *   user: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *   }
 * });
 * ```
 */
export async function createSession<TData = Record<string, unknown>>(
  session: Session<TData>,
  options: CreateSessionOptions = {}
): Promise<string> {
  logger.debug('Creating new session');

  const { sessionDurationDays = 7 } = options;

  try {
    // Build the JWT payload and encrypt
    const jwt = await createEncryptedJWT({ ...session });

    logger.info({ sessionDurationDays }, 'Session created successfully');
    return jwt;
  } catch (error) {
    logger.error({ error }, 'Failed to create session');
    throw error;
  }
}

/**
 * Retrieves the current session from the "session" cookie, if any.
 * Uses React server components' cache for performance.
 *
 * This function:
 * 1. Gets the session cookie
 * 2. Validates the JWT
 * 3. Returns the session if valid, null otherwise
 *
 * @param config - Optional OAuth config (currently unused, kept for compatibility)
 * @returns Session object or null if no valid session exists
 *
 * @example
 * ```ts
 * // In a server component or server action
 * const session = await getCurrentSession();
 * if (session) {
 *   console.log('User:', session.user);
 * } else {
 *   // User not logged in
 * }
 * ```
 */
export const getCurrentSession = cache(async (config?: OAuthConfig): Promise<Session<any> | null> => {
  logger.debug('Retrieving current session');

  try {
    const sessionCookie = await getSessionCookie();

    if (!sessionCookie) {
      logger.debug('No session cookie found');
      return null;
    }

    const { status, session } = await validateSessionJwt(sessionCookie);

    if (status !== 'VALID') {
      logger.warn({ status }, 'Session validation failed');
      return null;
    }

    if (!session) {
      logger.warn('Session validation succeeded but no session object returned');
      return null;
    }

    logger.debug('Current session retrieved successfully');
    return session;
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

/**
 * Refreshes the current session using the refresh token.
 *
 * This function:
 * 1. Gets the current session
 * 2. Uses the refresh token to get new access tokens
 * 3. Updates the session cookie with new tokens
 * 4. Returns the updated session
 *
 * @param config - OAuth configuration
 * @param options - Session creation options
 * @returns Updated session or null if refresh failed
 *
 * @example
 * ```ts
 * const updatedSession = await refreshCurrentSession(oauthConfig);
 * if (updatedSession) {
 *   // Session refreshed successfully
 * } else {
 *   // Refresh failed, user needs to log in again
 *   redirect('/login');
 * }
 * ```
 */
export async function refreshCurrentSession(
  config: OAuthConfig,
  options: CreateSessionOptions = {}
): Promise<Session | null> {
  logger.info('Starting session refresh');

  try {
    const currentSession = await getCurrentSession();

    if (!currentSession) {
      logger.warn('No current session to refresh');
      return null;
    }

    if (!currentSession.tokens?.refreshToken) {
      logger.error('Current session has no refresh token');
      return null;
    }

    // Use the core refresh function
    const updatedSession = await refreshSessionCore(currentSession, config, options);

    if (!updatedSession) {
      logger.error('Session refresh returned null');
      return null;
    }

    // Create new encrypted JWT
    const jwt = await createSession(updatedSession, options);

    // Update the session cookie
    await setSessionCookie(jwt);

    logger.info('Session refreshed and cookie updated successfully');
    return updatedSession;
  } catch (error) {
    // Check if this is an expected invalid_grant error
    const err = error as { code?: string; error?: string; };
    const isInvalidGrant = err?.code === 'OAUTH_RESPONSE_BODY_ERROR' && err?.error === 'invalid_grant';

    if (isInvalidGrant) {
      // Expected during logout/session expiry - log at info level
      logger.info('Session refresh failed - refresh token expired or invalid');
    } else {
      // Unexpected error - log at error level
      logger.error({ error }, 'Failed to refresh current session');
    }

    return null;
  }
}

/**
 * Creates and persists a new session.
 *
 * This is a convenience function that combines createSession and setSessionCookie.
 * Use this after successful authentication to establish a user session.
 *
 * @param session - Session data
 * @param options - Session creation options
 * @returns The encrypted JWT that was stored in the cookie
 *
 * @example
 * ```ts
 * // After successful OAuth callback
 * await createAndPersistSession({
 *   tokens: {
 *     accessToken: tokens.access_token,
 *     refreshToken: tokens.refresh_token,
 *   },
 *   user: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *   }
 * }, { sessionDurationDays: 30 });
 * ```
 */
export async function createAndPersistSession(
  session: Session,
  options: CreateSessionOptions = {}
): Promise<string> {
  logger.info('Creating and persisting new session');

  try {
    const jwt = await createSession(session, options);
    await setSessionCookie(jwt);

    logger.info('Session created and persisted successfully');
    return jwt;
  } catch (error) {
    logger.error({ error }, 'Failed to create and persist session');
    throw error;
  }
}

/**
 * Clears the current session by deleting the session cookie.
 * Use this when logging out or when session validation fails.
 *
 * @example
 * ```ts
 * await clearCurrentSession();
 * redirect('/');
 * ```
 */
export async function clearCurrentSession(): Promise<void> {
  logger.info('Clearing current session');

  try {
    await deleteSessionCookie();
    logger.info('Session cleared successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to clear session');
    throw error;
  }
}

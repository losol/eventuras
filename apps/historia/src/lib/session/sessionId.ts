'use server';

import crypto from 'crypto';

import { getCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:session',
  context: { module: 'sessionId' },
});

interface SessionData {
  sessionId?: string;
  [key: string]: unknown;
}

/**
 * Get or create a session ID for tracking user activity across requests
 *
 * This works for both:
 * - Anonymous users (guest checkout)
 * - Authenticated users
 *
 * The sessionId is stored in session.data and persists across requests
 * until the session cookie expires.
 *
 * @returns sessionId string or null if session creation failed
 *
 * @example
 * ```typescript
 * const sessionId = await getOrCreateSessionId();
 * logger.info({ sessionId }, 'Processing payment');
 * ```
 */
export async function getOrCreateSessionId(): Promise<string | null> {
  try {
    const session = await getCurrentSession();

    // If no session exists at all, we can't create one here
    // (session creation happens via authentication or explicit session setup)
    if (!session) {
      logger.debug('No session found - cannot create sessionId');
      return null;
    }

    const sessionData = (session.data || {}) as SessionData;

    // Return existing sessionId if present
    if (sessionData.sessionId) {
      logger.debug({ sessionId: sessionData.sessionId }, 'Using existing sessionId');
      return sessionData.sessionId;
    }

    // Generate new sessionId
    const newSessionId = crypto.randomUUID();

    logger.info({ sessionId: newSessionId }, 'Generated new sessionId');

    // Note: We return the sessionId but don't save it back to the session here
    // The session should be updated by the caller if needed (e.g., when creating cart)
    // This avoids unnecessary session updates on every request

    return newSessionId;
  } catch (error) {
    logger.error({ error }, 'Failed to get or create sessionId');
    return null;
  }
}

/**
 * Get session context for logging
 *
 * Returns session-related information useful for correlating logs:
 * - sessionId (from session.data)
 * - userId (if authenticated)
 *
 * Note: We deliberately do NOT include userEmail to avoid logging personal data (GDPR)
 *
 * @returns Object with session context or empty object if no session
 *
 * @example
 * ```typescript
 * const sessionContext = await getSessionContext();
 * logger.info({
 *   ...sessionContext,
 *   paymentReference
 * }, 'Processing payment');
 * // Logs: { sessionId: 'abc-123', userId: 'user-id-456', paymentReference: 'xxx' }
 * ```
 */
export async function getSessionContext(): Promise<{
  sessionId?: string;
  userId?: string;
}> {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return {};
    }

    const sessionData = (session.data || {}) as SessionData;

    // Extract userId from user object - it may be stored as 'sub' in some auth systems
    // or as a custom field in session.data
    const userId = (session.user as any)?.sub || (session.user as any)?.id || (sessionData as any)?.userId;

    return {
      sessionId: sessionData.sessionId,
      userId,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get session context');
    return {};
  }
}

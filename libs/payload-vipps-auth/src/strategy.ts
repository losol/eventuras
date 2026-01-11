/**
 * Vipps Authentication Strategy for Payload CMS
 *
 * Provides a custom authentication strategy for Vipps OAuth login.
 * The callback sets a temporary cookie, and this strategy reads it to authenticate the user.
 *
 * @see https://payloadcms.com/docs/authentication/custom-strategies
 */

import { Logger } from '@eventuras/logger';
import type { AuthStrategy, AuthStrategyResult } from 'payload';
import { v4 as uuidv4 } from 'uuid';

const logger = Logger.create({
  namespace: 'payload-vipps-auth:strategy',
  context: { module: 'VippsAuthStrategy' },
});

/** Cookie name for temporary Vipps authentication session */
export const VIPPS_SESSION_PENDING_COOKIE = '__vipps_session_pending';

/**
 * Parse cookies from headers
 */
function parseCookies(headers: Headers): Map<string, string> {
  const cookieHeader = headers.get('cookie');
  if (!cookieHeader) return new Map();

  const cookies = new Map<string, string>();
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name) {
      try {
        cookies.set(name, decodeURIComponent(rest.join('=')));
      } catch {
        cookies.set(name, rest.join('='));
      }
    }
  }
  return cookies;
}

/**
 * Create a Vipps authentication strategy for Payload CMS
 *
 * This strategy reads a temporary cookie set by the OAuth callback,
 * finds the user by email, and returns them. Payload then handles
 * the JWT session automatically.
 *
 * @param collection - The user collection slug (default: 'users')
 * @returns Payload authentication strategy
 *
 * @example
 * ```typescript
 * // In your users collection config
 * import { createVippsAuthStrategy } from '@eventuras/payload-vipps-auth';
 *
 * const Users: CollectionConfig = {
 *   slug: 'users',
 *   auth: {
 *     strategies: [
 *       createVippsAuthStrategy(),
 *     ],
 *   },
 * };
 * ```
 */
export function createVippsAuthStrategy(collection = 'users'): AuthStrategy {
  return {
    name: 'vipps',
    authenticate: async ({ payload, headers }) => {
      logger.debug('Vipps strategy authenticate called');

      const cookies = parseCookies(headers);
      const sessionToken = cookies.get(VIPPS_SESSION_PENDING_COOKIE);

      if (!sessionToken) {
        // No Vipps pending session cookie, skip this strategy
        logger.debug('No Vipps pending session cookie found');
        return { user: null };
      }

      logger.debug('Vipps pending session cookie found, validating...');

      // Decrypt and validate the session token
      let vippsEmail: string;
      try {
        const { validateSessionJwt } = await import('@eventuras/fides-auth/session-validation');
        const { status, session } = await validateSessionJwt(sessionToken);

        if (status !== 'VALID' || !session?.user?.email) {
          logger.warn({ status }, 'Invalid Vipps pending session');
          return { user: null };
        }

        vippsEmail = session.user.email as string;
        logger.debug({ email: vippsEmail }, 'Decrypted Vipps session, looking up user');
      } catch (error) {
        logger.error({ error }, 'Failed to decrypt Vipps session');
        return { user: null };
      }

      // Find user by email
      const users = await payload.find({
        collection,
        where: {
          email: { equals: vippsEmail },
        },
        limit: 1,
      });

      if (users.docs.length === 0) {
        logger.warn({ email: vippsEmail }, 'User not found for Vipps auth');
        return { user: null };
      }

      const user = users.docs[0];
      if (!user) {
        return { user: null };
      }

      logger.info({ userId: user.id, email: user.email }, 'Vipps authentication successful');

      // Create new session if session management is enabled
      const userCollection = payload.collections[collection];
      const authConfig = userCollection?.config.auth;

      logger.info({
        hasAuthConfig: !!authConfig,
        useSessions: authConfig?.useSessions,
        tokenExpiration: authConfig?.tokenExpiration
      }, 'SESSION CONFIG CHECK');

      let sid: string | undefined;

      if (authConfig?.useSessions) {
        logger.info('CREATING SESSION - useSessions is true');
        sid = uuidv4();
        logger.info({ sessionId: sid }, 'Generated session ID');
        const now = new Date();
        const tokenExpInMs = (authConfig.tokenExpiration || 7200) * 1000;
        const expiresAt = new Date(now.getTime() + tokenExpInMs);

        const session = {
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          id: sid,
        };

        // Remove expired sessions and add new session
        const existingSessions = Array.isArray((user as any).sessions) ? (user as any).sessions : [];
        const activeSessions = existingSessions.filter((s: any) =>
          new Date(s.expiresAt) > now
        );

        // Update user with new session
        await payload.update({
          collection,
          id: user.id,
          data: {
            sessions: [...activeSessions, session],
          },
        });

        logger.debug({ userId: user.id, sessionId: sid }, 'Created new session');
      }

      // Return the user with the collection and strategy
      // Also clear the temporary pending session cookie via responseHeaders
      const responseHeaders = new Headers();
      responseHeaders.append(
        'Set-Cookie',
        `${VIPPS_SESSION_PENDING_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      );

      return {
        user: {
          ...user,
          collection,
          _strategy: 'vipps',
          _sid: sid,
        } as AuthStrategyResult['user'],
        responseHeaders,
      };
    },
  };
}


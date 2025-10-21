'use server';

import {
  getCurrentSession,
  accessTokenExpires,
  refreshCurrentSession,
} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';
import { cookies } from 'next/headers';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:utils:getAccessToken' });

/**
 * Returns a valid access token for the current session.
 *
 * This function will:
 * 1. Check if a session exists
 * 2. Validate the access token
 * 3. If token is expired or about to expire (within 10s), attempt to refresh it
 * 4. Return the valid token or null if refresh fails
 *
 * Token refresh updates the session cookie, so subsequent calls will use the new token.
 *
 * @returns {Promise<string | null>} A valid access token or null if unavailable.
 */
export async function getAccessToken(): Promise<string | null> {
  // Retrieve the session cookie
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    logger.debug('No session cookie found');
    return null;
  }

  // Get the current session
  const session = await getCurrentSession(oauthConfig);

  if (!session) {
    logger.warn('Session decoding failed');
    return null;
  }

  if (!session.tokens?.accessToken) {
    logger.warn('No access token found in session');
    return null;
  }

  // Check if token is expired or about to expire (within 10 seconds)
  const tokenExpiring = accessTokenExpires(session.tokens.accessToken, 10);

  if (tokenExpiring) {
    logger.info('Access token expired or expiring soon, attempting refresh');

    // Check if we have a refresh token
    if (!session.tokens?.refreshToken) {
      logger.warn('No refresh token available, cannot refresh');
      return null;
    }

    try {
      // Attempt to refresh the session
      const refreshedSession = await refreshCurrentSession(oauthConfig);

      if (!refreshedSession) {
        logger.info('Token refresh failed - user needs to re-authenticate');
        return null;
      }

      if (!refreshedSession.tokens?.accessToken) {
        logger.error('Refreshed session has no access token');
        return null;
      }

      logger.info('Token refreshed successfully');
      return refreshedSession.tokens.accessToken;
    } catch (error) {
      // Check if it's an invalid_grant error (expected when refresh token is expired)
      const err = error as { code?: string; error?: string };
      if (err?.code === 'OAUTH_RESPONSE_BODY_ERROR' && err?.error === 'invalid_grant') {
        logger.info('Refresh token expired or invalid - user needs to re-authenticate');
      } else {
        logger.error({ error }, 'Unexpected error refreshing token');
      }
      return null;
    }
  }

  logger.debug('Returning valid access token');
  return session.tokens.accessToken;
}

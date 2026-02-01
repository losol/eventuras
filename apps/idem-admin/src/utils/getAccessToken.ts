'use server';

import { cookies } from 'next/headers';

import {
  accessTokenExpires,
  getCurrentSession,
  refreshCurrentSession,
} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import { getOAuthConfig } from '@/utils/config';

const logger = Logger.create({ namespace: 'idem-admin:utils:getAccessToken' });

/**
 * Returns a valid access token for the current session.
 *
 * This function will:
 * 1. Check if a session exists
 * 2. Validate the access token
 * 3. If token is expired or about to expire (within 10s), attempt to refresh it
 * 4. Return the valid token or null if refresh fails
 */
export async function getAccessToken(): Promise<string | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    logger.debug('No session cookie found');
    return null;
  }

  const session = await getCurrentSession(getOAuthConfig());

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

    if (!session.tokens?.refreshToken) {
      logger.warn('No refresh token available, cannot refresh');
      return null;
    }

    try {
      const refreshedSession = await refreshCurrentSession(getOAuthConfig());

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

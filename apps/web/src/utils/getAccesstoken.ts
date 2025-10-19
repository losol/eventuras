'use server';

import {getCurrentSession} from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';
import { cookies } from 'next/headers';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:utils:getAccessToken' });

/**
 * Returns a access token for the current session.
 *
 * @returns {Promise<string | null>} The access token or null if it cannot be obtained.
 */
export async function getAccessToken(): Promise<string | null> {

  // Retrieve the session cookie.
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    logger.debug('No session cookie found when attempting to get access token');
    return null;
  }

  // Get the current session using our helper. This function only reads cookies.
  const session = await getCurrentSession(oauthConfig);

  if (!session) {
    logger.warn('Session decoding failed - unable to parse session cookie');
    return null;
  }

  if (!session.tokens?.accessToken) {
    logger.warn('No access token found in session object');
    return null;
  }

  logger.debug('Access token retrieved successfully');
  return session.tokens.accessToken;
}

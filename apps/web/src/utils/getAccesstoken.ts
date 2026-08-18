'use server';

import {
  accessTokenExpires,
  getCurrentSession,
  tryRefreshCurrentSession,
} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:utils:getAccessToken' });

/**
 * Returns a valid access token for the current session, refreshing when the
 * stored one is missing, expired or about to expire (within 10s). Refreshing
 * updates the session cookies, so subsequent calls use the new token.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  if (!session) {
    logger.debug('No session found');
    return null;
  }

  const accessToken = session.tokens?.accessToken;
  if (accessToken && !accessTokenExpires(accessToken, 10)) {
    return accessToken;
  }

  if (!session.tokens?.refreshToken) {
    logger.warn({ sid: session.sid }, 'No refresh token available, cannot refresh');
    return null;
  }

  const result = await tryRefreshCurrentSession(oauthConfig);
  if (!result.ok) {
    if (result.reason === 'refresh_failed' && result.cause !== 'invalid_grant') {
      // Provider blip — the session is likely still fine, just no token now.
      logger.warn(
        { reason: result.reason, cause: result.cause, sid: result.sid },
        'Token refresh failed transiently'
      );
    } else {
      logger.info(
        { reason: result.reason, cause: result.cause, sid: result.sid },
        'Token refresh failed, re-authentication required'
      );
    }
    return null;
  }

  return result.session.tokens?.accessToken ?? null;
}

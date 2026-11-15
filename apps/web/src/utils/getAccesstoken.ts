import { Logger } from '@eventuras/logger';

import { auth } from '@/utils/auth/fidesAuth';

const logger = Logger.create({ namespace: 'web:utils:getAccessToken' });

/**
 * The session's access token, or null without a session. `proxy.ts` refreshes it
 * before the request reaches a page, action or route, so this only reads.
 */
export async function getAccessToken(): Promise<string | null> {
  const tokens = await auth.getTokens();
  if (!tokens?.accessToken) {
    logger.debug('No access token in session');
    return null;
  }
  return tokens.accessToken;
}

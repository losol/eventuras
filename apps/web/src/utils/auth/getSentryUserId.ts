'use server';

import { decodeJwt } from 'jose';

import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:utils:getSentryUserId' });

/**
 * Returns the OIDC `sub` claim from the current session's access token, or
 * `null` if no session exists. Used to attach a stable user identifier to
 * Sentry events without exposing name/email.
 */
export async function getSentryUserId(): Promise<string | null> {
  try {
    const session = await getCurrentSession(oauthConfig);
    const accessToken = session?.tokens?.accessToken;

    if (!accessToken) {
      return null;
    }

    const payload = decodeJwt(accessToken);
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch (error) {
    logger.debug({ error }, 'Failed to read user id from session');
    return null;
  }
}

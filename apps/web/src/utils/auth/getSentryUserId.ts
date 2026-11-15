'use server';

import { Logger } from '@eventuras/logger';

import { auth } from '@/utils/auth/fidesAuth';

const logger = Logger.create({ namespace: 'web:utils:getSentryUserId' });

/**
 * Returns the OIDC `sub` of the current session's user, or `null` without a
 * session. Used to attach a stable user identifier to Sentry events without
 * exposing name/email.
 */
export async function getSentryUserId(): Promise<string | null> {
  try {
    const session = await auth.readSession();
    return session?.user?.sub || null;
  } catch (error) {
    logger.debug({ error }, 'Failed to read user id from session');
    return null;
  }
}

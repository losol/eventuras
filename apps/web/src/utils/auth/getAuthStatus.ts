'use server';

import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { getAccessToken } from '@/utils/getAccesstoken';
import { oauthConfig } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:utils:getAuthStatus' });

export type AuthStatus = {
  authenticated: boolean;
  user?: {
    name?: string;
    email?: string;
    roles?: string[];
    [key: string]: unknown;
  };
};

/**
 * Get the current authentication status
 * Server action that can be called from client components
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  try {
    const token = await getAccessToken();

    if (!token) {
      return { authenticated: false };
    }

    // Get session to retrieve user info
    const session = await getCurrentSession(oauthConfig);

    if (!session?.user) {
      // If we have a token but no user session, treat as unauthenticated
      return { authenticated: false };
    }

    logger.info({ roles: session.user.roles }, 'User authenticated');

    return {
      authenticated: true,
      user: session.user,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get auth status');
    return { authenticated: false };
  }
}

'use server';

import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

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
    const session = await getCurrentSession(oauthConfig);

    if (!session?.user || !session?.tokens?.accessToken) {
      return { authenticated: false };
    }

    logger.debug({ roles: session.user.roles }, 'User authenticated');

    return {
      authenticated: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        roles: session.user.roles,
      },
    };
  } catch (error) {
    logger.debug({ error }, 'No active session');
    return { authenticated: false };
  }
}

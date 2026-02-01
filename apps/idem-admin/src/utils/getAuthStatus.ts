'use server';

import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { getAccessToken } from '@/utils/getAccessToken';
import { getOAuthConfig } from '@/utils/config';

const logger = Logger.create({ namespace: 'idem-admin:utils:getAuthStatus' });

export type AuthStatus = {
  authenticated: boolean;
  user?: {
    name?: string;
    email?: string;
    roles?: string[];
    systemRole?: string;
    [key: string]: unknown;
  };
};

type SessionData = {
  systemRole?: string;
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

    const session = await getCurrentSession(getOAuthConfig());

    if (!session?.user) {
      return { authenticated: false };
    }

    // Extract systemRole from session data
    const sessionData = session.data as SessionData | undefined;
    const systemRole = sessionData?.systemRole;

    logger.info({ systemRole }, 'User authenticated');

    return {
      authenticated: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        roles: session.user.roles,
        systemRole,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get auth status');
    return { authenticated: false };
  }
}

import { Logger } from '@eventuras/logger';

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
 * Fetches the current authentication status from the server.
 *
 * Backed by `GET /api/auth/status` rather than a Server Action: Server Actions
 * POST to the current route URL, which can race with in-flight client
 * navigations and silently cancel them in the Next.js app router.
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  try {
    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    return (await response.json()) as AuthStatus;
  } catch (error) {
    logger.debug({ error }, 'Auth status fetch failed');
    return { authenticated: false };
  }
}

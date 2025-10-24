import { createStore } from '@xstate/store';
import { Logger } from '@eventuras/logger';
import type { SessionUser, AuthStatus } from './types';

/**
 * Authentication store context
 */
export type AuthStoreContext = {
  user: SessionUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastChecked: Date | null;
  isInitializing: boolean;
};

/**
 * Configuration for the auth store
 */
export type AuthStoreConfig = {
  /**
   * Function to check current authentication status
   */
  checkAuthStatus: () => Promise<AuthStatus>;

  /**
   * Optional configuration
   */
  config?: {
    /**
     * Role name that indicates admin access
     * @default 'Admin'
     */
    adminRole?: string;

    /**
     * Namespace for logger
     * @default 'fides-auth-next:store'
     */
    loggerNamespace?: string;
  };
};

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  adminRole: 'Admin',
  loggerNamespace: 'fides:auth-store',
};

/**
 * Creates an authentication store with XState Store
 *
 * @param options - Configuration for the auth store
 * @returns Configured XState store
 *
 * @example
 * ```typescript
 * const authStore = createAuthStore({
 *   checkAuthStatus: async () => getAuthStatus(),
 *   config: {
 *     adminRole: 'Admin',
 *     loggerNamespace: 'myapp:auth',
 *   }
 * });
 * ```
 */
export function createAuthStore(options: AuthStoreConfig) {
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const logger = Logger.create({
    namespace: config.loggerNamespace,
    context: { component: 'AuthStore' },
  });

  /**
   * Initial context values
   */
  const initialContext: AuthStoreContext = {
    user: null,
    isAdmin: false,
    isAuthenticated: false,
    error: null,
    lastChecked: null,
    isInitializing: true,
  };

  /**
   * Create the store with events
   */
  const store = createStore(
    {
      context: initialContext,
      on: {
        /**
         * Initialize authentication - check current status
         */
        initialize: () => ({
          user: null,
          isAdmin: false,
          isAuthenticated: false,
          error: null,
          lastChecked: null,
          isInitializing: true,
        }),

        /**
         * Authentication check succeeded
         */
        authSuccess: (_context: AuthStoreContext, event: { user: SessionUser; }) => {
          logger.info({ user: event.user.email }, 'User authenticated');
          return {
            user: event.user,
            isAdmin: event.user.roles?.includes(config.adminRole) ?? false,
            isAuthenticated: true,
            error: null,
            lastChecked: new Date(),
            isInitializing: false,
          };
        },

        /**
         * Authentication check failed - not authenticated
         */
        authFailed: (_context: AuthStoreContext, event: { error?: string; } = {}) => {
          logger.info('User not authenticated');
          return {
            user: null,
            isAdmin: false,
            isAuthenticated: false,
            error: event.error || null,
            lastChecked: new Date(),
            isInitializing: false,
          };
        },

        /**
         * Session expired
         */
        sessionExpired: () => {
          logger.warn('Session expired');
          return {
            user: null,
            isAdmin: false,
            isAuthenticated: false,
            error: 'Session expired',
            lastChecked: new Date(),
            isInitializing: false,
          };
        },

        /**
         * User logged out
         */
        logout: () => {
          logger.info('User logged out');
          return {
            user: null,
            isAdmin: false,
            isAuthenticated: false,
            error: null,
            lastChecked: new Date(),
            isInitializing: false,
          };
        },

        /**
         * Login success
         */
        loginSuccess: (_context: AuthStoreContext, event: { user: SessionUser; }) => {
          logger.info({ user: event.user.email }, 'Login successful');
          return {
            user: event.user,
            isAdmin: event.user.roles?.includes(config.adminRole) ?? false,
            isAuthenticated: true,
            error: null,
            lastChecked: new Date(),
            isInitializing: false,
          };
        },

        /**
         * Update last checked timestamp
         */
        updateLastChecked: (context: AuthStoreContext) => ({
          ...context,
          lastChecked: new Date(),
        }),

        /**
         * Set error
         */
        setError: (context: AuthStoreContext, event: { error: string; }) => ({
          ...context,
          error: event.error,
        }),

        /**
         * Clear error
         */
        clearError: (context: AuthStoreContext) => ({
          ...context,
          error: null,
        }),
      },
    }
  );

  return store;
}

/**
 * Helper function to initialize auth by checking status
 */
export async function initializeAuth(
  store: ReturnType<typeof createAuthStore>,
  checkAuthStatus: () => Promise<AuthStatus>
) {
  const logger = Logger.create({
    namespace: 'fides:auth-store',
    context: { component: 'initializeAuth' },
  });

  logger.debug('Initializing authentication');
  store.send({ type: 'initialize' });

  try {
    const result = await checkAuthStatus();
    logger.debug({ authenticated: result.authenticated }, 'Auth status checked');

    if (result.authenticated && result.user) {
      store.send({ type: 'authSuccess', user: result.user });
    } else {
      store.send({ type: 'authFailed' });
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check auth status');
    store.send({
      type: 'authFailed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Helper function to check auth status and update store
 */
export async function checkAuth(
  store: ReturnType<typeof createAuthStore>,
  checkAuthStatus: () => Promise<AuthStatus>
) {
  const logger = Logger.create({
    namespace: 'fides:auth-store',
    context: { component: 'checkAuth' },
  });

  logger.debug('Checking authentication status');

  try {
    const result = await checkAuthStatus();
    logger.debug({ authenticated: result.authenticated }, 'Auth status checked');

    if (result.authenticated && result.user) {
      store.send({ type: 'authSuccess', user: result.user });
    } else {
      store.send({ type: 'authFailed' });
    }

    store.send({ type: 'updateLastChecked' });
  } catch (error) {
    // Check if this is an expected invalid_grant error (expired refresh token)
    const err = error as { code?: string; error?: string; error_description?: string; };
    const isInvalidGrant =
      err?.code === 'OAUTH_RESPONSE_BODY_ERROR' && err?.error === 'invalid_grant';

    if (isInvalidGrant) {
      // This is expected during logout or session expiry - log at info level
      logger.info('Session ended - refresh token expired or invalid');
      store.send({ type: 'sessionExpired' });
    } else {
      // Unexpected error during auth check - log with details
      const errorDetails: Record<string, unknown> = {
        message: error instanceof Error ? error.message : 'Unknown error',
      };

      // Extract OAuth error details if present
      if (error && typeof error === 'object') {
        const oauthError = error as any;
        if (oauthError.code) errorDetails.code = oauthError.code;
        if (oauthError.error) errorDetails.error = oauthError.error;
        if (oauthError.error_description)
          errorDetails.error_description = oauthError.error_description;
        if (oauthError.status) errorDetails.status = oauthError.status;
      }

      logger.error(errorDetails, 'Auth check error');
      store.send({
        type: 'authFailed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

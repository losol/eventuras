import { assign, createMachine, fromPromise } from 'xstate';
import { Logger } from '@eventuras/logger';
import type {
  AuthMachineContext,
  AuthMachineEvents,
  AuthMachineConfig,
} from './types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  sessionMonitorInterval: 30_000, // 30 seconds
  loggerNamespace: 'fides:auth-machine',
  adminRole: 'Admin',
};

/**
 * Initial context values
 */
const initialContext: AuthMachineContext = {
  user: null,
  isAdmin: false,
  error: null,
  lastChecked: null,
};

/**
 * Creates an authentication state machine configured with the provided options
 *
 * @param options - Configuration for the auth machine
 * @returns Configured XState machine
 *
 * @example
 * ```typescript
 * const authMachine = createAuthMachine({
 *   checkAuthStatus: async () => getAuthStatus(),
 *   config: {
 *     sessionMonitorInterval: 30_000,
 *     loggerNamespace: 'myapp:auth',
 *   }
 * });
 * ```
 */
export function createAuthMachine(options: AuthMachineConfig) {
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const logger = Logger.create({
    namespace: config.loggerNamespace,
    context: { component: 'AuthMachine' },
  });

  /**
   * Service: Check authentication status once
   */
  const checkAuthStatus = fromPromise(async () => {
    logger.debug('Checking authentication status');
    try {
      const result = await options.checkAuthStatus();
      logger.debug({ authenticated: result.authenticated }, 'Auth status checked');
      return result;
    } catch (error) {
      logger.error({ error }, 'Failed to check auth status');
      throw error;
    }
  });

  /**
   * Service: Monitor session continuously
   * Polls auth status at regular intervals
   */
  const monitorSession = fromPromise(async ({ input }: { input: { interval: number } }) => {
    logger.debug({ interval: input.interval }, 'Starting session monitor');

    const poll = async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, input.interval));

      try {
        const result = await options.checkAuthStatus();
        logger.debug({ authenticated: result.authenticated }, 'Session monitor check');

        if (!result.authenticated) {
          logger.warn('Session monitor detected unauthenticated state');
          throw new Error('Session expired');
        }
      } catch (error) {
        logger.error({ error }, 'Session monitor error');
        throw error;
      }

      // Continue polling
      return poll();
    };

    return poll();
  });

  /**
   * Service: Refresh access token
   */
  const refreshAccessToken = fromPromise(async () => {
    logger.info('Refreshing access token');
    try {
      // Trigger a status check which will cause middleware to refresh if needed
      const result = await options.checkAuthStatus();
      logger.info('Token refresh completed');
      return result;
    } catch (error) {
      logger.error({ error }, 'Token refresh failed');
      throw error;
    }
  });

  /**
   * Authentication State Machine
   */
  return createMachine(
    {
      id: 'auth',
      initial: 'initializing',
      types: {} as {
        context: AuthMachineContext;
        events: AuthMachineEvents;
      },
      context: initialContext,

      states: {
        /**
         * Initial state - checking if user is already authenticated
         */
        initializing: {
          entry: () => logger.info('Initializing authentication'),
          invoke: {
            src: 'checkAuthStatus',
            onDone: [
              {
                target: 'authenticated',
                actions: assign({
                  user: ({ event }) => event.output.user || null,
                  isAdmin: ({ event }) =>
                    event.output.user?.roles?.includes(config.adminRole) ?? false,
                  error: null,
                  lastChecked: () => new Date(),
                }),
                guard: ({ event }) => event.output.authenticated,
              },
              {
                target: 'notAuthenticated',
                actions: () => logger.info('User not authenticated'),
              }
            ],
            onError: {
              target: 'notAuthenticated',
              actions: assign({
                error: ({ event }) => (event.error as Error).message,
              }),
            },
          },
        },

        /**
         * User is not authenticated
         */
        notAuthenticated: {
          entry: [assign(initialContext), () => logger.info('User not authenticated')],
          on: {
            LOGIN_SUCCESS: {
              target: 'authenticated',
              actions: assign({
                user: ({ event }) => event.user,
                isAdmin: ({ event }) => event.user.roles?.includes(config.adminRole) ?? false,
                error: null,
                lastChecked: () => new Date(),
              }),
            },
            CHECK_AUTH: {
              target: 'initializing',
            },
          },
        },

        /**
         * User is authenticated
         */
        authenticated: {
          initial: 'active',
          entry: () => logger.info('User authenticated'),

          states: {
            /**
             * Normal authenticated state with session monitoring
             */
            active: {
              entry: () => logger.debug('Entering active authenticated state'),
              invoke: {
                src: 'monitorSession',
                input: { interval: config.sessionMonitorInterval },
                onError: {
                  target: '#auth.sessionExpired',
                  actions: () => logger.warn('Session monitor detected expiration'),
                },
              },
              on: {
                REFRESH_TOKEN: {
                  target: 'refreshingToken',
                  actions: () => logger.info('Manual token refresh requested'),
                },
                SESSION_EXPIRED: {
                  target: '#auth.sessionExpired',
                },
                LOGOUT: {
                  target: '#auth.notAuthenticated',
                },
              },
            },

            /**
             * Refreshing access token
             */
            refreshingToken: {
              entry: () => logger.info('Refreshing token'),
              invoke: {
                src: 'refreshAccessToken',
                onDone: {
                  target: 'active',
                  actions: [
                    assign({
                      lastChecked: () => new Date(),
                    }),
                    () => logger.info('Token refreshed successfully'),
                  ],
                },
                onError: {
                  target: '#auth.sessionExpired',
                  actions: [
                    assign({
                      error: ({ event }) => (event.error as Error).message,
                    }),
                    ({ event }) => logger.error({ error: event.error }, 'Token refresh failed'),
                  ],
                },
              },
            },
          },

          on: {
            LOGOUT: {
              target: 'notAuthenticated',
              actions: () => logger.info('User logged out'),
            },
          },
        },

        /**
         * Session has expired
         */
        sessionExpired: {
          entry: [
            assign({
              user: null,
              isAdmin: false,
              error: 'Session expired',
            }),
            () => logger.warn('Session expired'),
          ],
          on: {
            CHECK_AUTH: {
              target: 'initializing',
            },
            LOGIN_SUCCESS: {
              target: 'authenticated',
              actions: assign({
                user: ({ event }) => event.user,
                isAdmin: ({ event }) => event.user.roles?.includes(config.adminRole) ?? false,
                error: null,
                lastChecked: () => new Date(),
              }),
            },
          },
        },
      },
    },
    {
      actors: {
        checkAuthStatus,
        monitorSession,
        refreshAccessToken,
      },
    }
  );
}

/**
 * Authentication Store for Next.js
 *
 * This package provides XState Store-based authentication state management:
 *
 * - Simpler data-focused state management
 * - Easier to understand and maintain
 * - Perfect for authentication data and status
 * - Apps can build complex workflows on top if needed
 *
 * ## Usage
 *
 * @example
 * ```typescript
 * import { createAuthStore, createAuthStoreHooks, initializeAuth, startSessionMonitor } from '@eventuras/fides-auth-next/store';
 * import { getAuthStatus } from './auth/getAuthStatus';
 *
 * // Create the store
 * export const authStore = createAuthStore({
 *   checkAuthStatus: getAuthStatus,
 *   config: {
 *     adminRole: 'Admin',
 *     loggerNamespace: 'myapp:auth',
 *   }
 * });
 *
 * // Create hooks
 * export const { useAuthStore, useAuthActions } = createAuthStoreHooks(authStore);
 *
 * // In your root component
 * function App() {
 *   useEffect(() => {
 *     // Initialize auth on mount
 *     initializeAuth(authStore, getAuthStatus);
 *
 *     // Start session monitoring
 *     return startSessionMonitor(authStore, getAuthStatus, {
 *       interval: 30_000,
 *       onSessionExpired: () => {
 *         toast.warn('Your session has expired');
 *       }
 *     });
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 *
 * // In any component
 * function MyComponent() {
 *   const auth = useAuthStore();
 *   const { logout } = useAuthActions();
 *
 *   if (auth.isInitializing) return <Spinner />;
 *   if (!auth.isAuthenticated) return <LoginButton />;
 *
 *   return (
 *     <div>
 *       Welcome, {auth.user?.name}!
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Building Complex Workflows
 *
 * You can use the Store for data management and build app-specific
 * state machines that consume the auth store for complex workflows:
 *
 * @example
 * ```typescript
 * import { createMachine } from 'xstate';
 * import { authStore } from './auth-store';
 *
 * const checkoutMachine = createMachine({
 *   context: ({ input }) => ({
 *     authStore: input.authStore,
 *     cart: [],
 *   }),
 *   states: {
 *     idle: {
 *       on: {
 *         START_CHECKOUT: {
 *           target: 'checkingAuth',
 *         }
 *       }
 *     },
 *     checkingAuth: {
 *       entry: ({ context }) => {
 *         const auth = context.authStore.getSnapshot().context;
 *         if (!auth.isAuthenticated) {
 *           // Trigger login flow
 *         }
 *       },
 *       // ... rest of workflow
 *     }
 *   }
 * });
 * ```
 */

// Store exports
export {
  createAuthStore,
  initializeAuth,
  checkAuth,
  type AuthStoreContext,
  type AuthStoreConfig,
} from './store';

export {
  createAuthStoreHooks,
  type AuthStoreSelector,
  type AuthStoreActions,
} from './hooks';

export {
  startSessionMonitor,
  type SessionMonitorConfig,
} from './session-monitor';

export { useSessionMonitor } from './use-session-monitor';

// Shared types
export type { SessionUser, AuthStatus } from './types';


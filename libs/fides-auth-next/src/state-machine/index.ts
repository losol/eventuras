/**
 * Authentication State Machine for Next.js
 *
 * Provides a robust, type-safe state machine for managing authentication state,
 * session monitoring, and token refresh workflows.
 *
 * @example
 * ```typescript
 * // Setup in your app
 * import { createAuthMachine, createAuthHooks } from '@eventuras/fides-auth-next/state-machine';
 * import { createActor } from 'xstate';
 * import { getAuthStatus } from './auth/getAuthStatus';
 *
 * const authMachine = createAuthMachine({
 *   checkAuthStatus: getAuthStatus,
 *   config: {
 *     sessionMonitorInterval: 30_000,
 *     loggerNamespace: 'myapp:auth',
 *   }
 * });
 *
 * export const authService = createActor(authMachine);
 * export const { useAuthSelector, useAuthActions } = createAuthHooks(authService);
 *
 * // In your root component
 * useEffect(() => {
 *   authService.start();
 *   return () => authService.stop();
 * }, []);
 *
 * // In any component
 * function MyComponent() {
 *   const { isAuthenticated, userName } = useAuthSelector();
 *   const { logout } = useAuthActions();
 *
 *   if (!isAuthenticated) return <LoginButton />;
 *   return <div>Welcome, {userName}! <button onClick={logout}>Logout</button></div>;
 * }
 * ```
 */

export { createAuthMachine } from './machine';
export { createAuthHooks } from './hooks';
export type {
  SessionUser,
  AuthStatus,
  AuthMachineContext,
  AuthMachineEvents,
  AuthMachineConfig,
  AuthSelector,
  AuthActions,
} from './types';

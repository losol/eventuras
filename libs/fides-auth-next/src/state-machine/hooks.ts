import { useSelector } from '@xstate/react';
import type { Actor, AnyActorLogic } from 'xstate';
import type {
  AuthMachineContext,
  AuthMachineEvents,
  AuthSelector,
  AuthActions,
  SessionUser,
} from './types';

/**
 * Creates React hooks for interacting with the auth state machine
 *
 * @param authService - The XState actor/service for the auth machine
 * @returns Object containing useAuthSelector and useAuthActions hooks
 *
 * @example
 * ```typescript
 * const authService = createActor(authMachine);
 * export const { useAuthSelector, useAuthActions } = createAuthHooks(authService);
 *
 * // In component
 * function MyComponent() {
 *   const { isAuthenticated, user, error, status } = useAuthSelector();
 *   const { logout } = useAuthActions();
 *
 *   if (error) {
 *     toast.error(error);
 *   }
 *
 *   if (status.isInitializing) {
 *     return <Spinner />;
 *   }
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? `Hello ${user?.name}` : 'Please login'}
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function createAuthHooks(authService: Actor<AnyActorLogic>) {
  /**
   * Hook to select authentication state and computed values
   *
   * @returns Object containing auth state and computed values
   */
  function useAuthSelector(): AuthSelector {
    const state = useSelector(authService, snapshot => snapshot);

    const isAuthenticated =
      state.matches('authenticated') || state.matches({ authenticated: 'active' });

    const user = state.context.user;
    const isAdmin = state.context.isAdmin;
    const error = state.context.error;

    // Current state for debugging and UI indicators
    const currentState =
      typeof state.value === 'string'
        ? state.value
        : typeof state.value === 'object'
          ? JSON.stringify(state.value)
          : 'unknown';

    // Status flags (loading/transition states)
    const status = {
      isInitializing: state.matches('initializing'),
      isSessionExpired: state.matches('sessionExpired'),
      isRefreshingToken: state.matches({ authenticated: 'refreshingToken' }),
    };

    return {
      isAuthenticated,
      isAdmin,
      user,
      error,
      currentState,
      status,
    };
  }

  /**
   * Hook to get action dispatchers for the auth machine
   *
   * @returns Object containing action dispatcher functions
   */
  function useAuthActions(): AuthActions {
    return {
      checkAuth: () => authService.send({ type: 'CHECK_AUTH' }),
      logout: () => authService.send({ type: 'LOGOUT' }),
      refreshToken: () => authService.send({ type: 'REFRESH_TOKEN' }),
      handleLoginSuccess: (user: SessionUser) =>
        authService.send({ type: 'LOGIN_SUCCESS', user }),
      handleSessionExpired: () => authService.send({ type: 'SESSION_EXPIRED' }),
    };
  }

  return {
    useAuthSelector,
    useAuthActions,
  };
}

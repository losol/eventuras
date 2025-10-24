import { useSelector as useStoreSelector } from '@xstate/store/react';
import type { SessionUser } from './types';
import type { createAuthStore } from './store';

/**
 * Return type for store-based auth hooks
 */
export type AuthStoreSelector = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: SessionUser | null;
  error: string | null;
  lastChecked: Date | null;
  isInitializing: boolean;
};

/**
 * Actions for store-based auth
 */
export type AuthStoreActions = {
  loginSuccess: (user: SessionUser) => void;
  logout: () => void;
  sessionExpired: () => void;
  authSuccess: (user: SessionUser) => void;
  authFailed: (error?: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
};

/**
 * Creates React hooks for interacting with the auth store
 *
 * @param store - The XState store instance
 * @returns Object containing useAuthStore hook
 *
 * @example
 * ```typescript
 * const authStore = createAuthStore({
 *   checkAuthStatus: getAuthStatus,
 * });
 *
 * export const { useAuthStore } = createAuthStoreHooks(authStore);
 *
 * // In component
 * function MyComponent() {
 *   const auth = useAuthStore();
 *
 *   if (auth.error) {
 *     toast.error(auth.error);
 *   }
 *
 *   if (auth.isInitializing) {
 *     return <Spinner />;
 *   }
 *
 *   return (
 *     <div>
 *       {auth.isAuthenticated ? `Hello ${auth.user?.name}` : 'Please login'}
 *     </div>
 *   );
 * }
 * ```
 */
export function createAuthStoreHooks(store: ReturnType<typeof createAuthStore>) {
  /**
   * Hook to access the auth store state
   */
  function useAuthStore(): AuthStoreSelector {
    const snapshot = useStoreSelector(store, (snapshot) => snapshot);
    return snapshot.context;
  }

  /**
   * Hook to get auth store actions
   */
  function useAuthActions(): AuthStoreActions {
    return {
      loginSuccess: (user: SessionUser) => store.send({ type: 'loginSuccess', user }),
      logout: () => store.send({ type: 'logout' }),
      sessionExpired: () => store.send({ type: 'sessionExpired' }),
      authSuccess: (user: SessionUser) => store.send({ type: 'authSuccess', user }),
      authFailed: (error?: string) => store.send({ type: 'authFailed', error }),
      setError: (error: string) => store.send({ type: 'setError', error }),
      clearError: () => store.send({ type: 'clearError' }),
    };
  }

  return {
    useAuthStore,
    useAuthActions,
  };
}

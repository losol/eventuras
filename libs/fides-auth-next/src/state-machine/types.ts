/**
 * Types for the Authentication State Machine
 *
 * These types are generic and can be used across different applications.
 */

/**
 * Represents a user session with basic information
 */
export type SessionUser = {
  name: string;
  email: string;
  roles: string[];
};

/**
 * Result of checking authentication status
 */
export type AuthStatus = {
  authenticated: boolean;
  user?: SessionUser;
};

/**
 * Context stored in the state machine
 */
export type AuthMachineContext = {
  user: SessionUser | null;
  isAdmin: boolean;
  error: string | null;
  lastChecked: Date | null;
};

/**
 * Events that can be sent to the state machine
 */
export type AuthMachineEvents =
  | { type: 'CHECK_AUTH' }
  | { type: 'AUTH_VALIDATED'; user: SessionUser }
  | { type: 'AUTH_FAILED' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'LOGOUT' }
  | { type: 'LOGIN_SUCCESS'; user: SessionUser }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'TOKEN_REFRESHED' }
  | { type: 'TOKEN_REFRESH_FAILED'; error: string };

/**
 * Configuration options for the auth state machine
 */
export type AuthMachineConfig = {
  /**
   * Function to check current authentication status
   * This is typically a server action or API call
   */
  checkAuthStatus: () => Promise<AuthStatus>;

  /**
   * Optional configuration
   */
  config?: {
    /**
     * Interval in milliseconds for session monitoring polling
     * @default 30000 (30 seconds)
     */
    sessionMonitorInterval?: number;

    /**
     * Namespace for logger
     * @default 'fides:auth-machine'
     */
    loggerNamespace?: string;

    /**
     * Role name that indicates admin access
     * @default 'Admin'
     */
    adminRole?: string;
  };
};

/**
 * Status flags for auth state transitions
 */
export type AuthStatus_Flags = {
  isInitializing: boolean;
  isSessionExpired: boolean;
  isRefreshingToken: boolean;
};

/**
 * Selector return type for useAuthSelector hook
 */
export type AuthSelector = {
  // Primary auth state
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: SessionUser | null;
  error: string | null;
  currentState: string;

  // Status flags (loading/transition states)
  status: AuthStatus_Flags;
};

/**
 * Actions return type for useAuthActions hook
 */
export type AuthActions = {
  checkAuth: () => void;
  logout: () => void;
  refreshToken: () => void;
  handleLoginSuccess: (user: SessionUser) => void;
  handleSessionExpired: () => void;
};

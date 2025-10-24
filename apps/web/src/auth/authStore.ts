/**
 * Authentication Store Configuration for Web App
 *
 * This file configures the auth store from @eventuras/fides-auth-next
 * with app-specific settings and the auth status checker.
 */

import { createAuthStore, createAuthStoreHooks } from '@eventuras/fides-auth-next/store';

import { getAuthStatus } from '@/utils/auth/getAuthStatus';

/**
 * Create the configured auth store
 */
export const authStore = createAuthStore({
  checkAuthStatus: getAuthStatus,
  config: {
    loggerNamespace: 'web:auth',
    adminRole: 'Admin',
  },
});

/**
 * Create React hooks for accessing auth state and actions
 */
export const { useAuthStore, useAuthActions } = createAuthStoreHooks(authStore);

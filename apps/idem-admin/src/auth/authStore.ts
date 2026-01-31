/**
 * Authentication Store Configuration for idem-idp Admin
 *
 * This file configures the auth store from @eventuras/fides-auth-next
 * with app-specific settings and the auth status checker.
 */

import { createAuthStore, createAuthStoreHooks } from '@eventuras/fides-auth-next/store';

import { getAuthStatus } from '@/utils/getAuthStatus';

/**
 * Create the configured auth store
 * Using 'system_admin' as the admin role to match idem-idp's role system
 */
export const authStore = createAuthStore({
  checkAuthStatus: getAuthStatus,
  config: {
    loggerNamespace: 'idem-admin:auth',
    adminRole: 'system_admin',
  },
});

/**
 * Create React hooks for accessing auth state and actions
 */
export const { useAuthStore, useAuthActions } = createAuthStoreHooks(authStore);

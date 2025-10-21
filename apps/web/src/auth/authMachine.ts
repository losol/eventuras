/**
 * Authentication State Machine Configuration for Web App
 *
 * This file configures the auth state machine from @eventuras/fides-auth-next
 * with app-specific settings and the auth status checker.
 */

import { createActor } from 'xstate';

import { createAuthHooks, createAuthMachine } from '@eventuras/fides-auth-next/state-machine';

import { getAuthStatus } from '@/utils/auth/getAuthStatus';

/**
 * Create the configured auth machine
 */
const authMachine = createAuthMachine({
  checkAuthStatus: getAuthStatus,
  config: {
    sessionMonitorInterval: 30_000, // 30 seconds
    loggerNamespace: 'web:auth',
    adminRole: 'Admin',
  },
});

/**
 * Create the auth service actor
 * This is the running instance of the state machine
 */
export const authService = createActor(authMachine);

/**
 * Create React hooks for accessing auth state and actions
 */
export const { useAuthSelector, useAuthActions } = createAuthHooks(authService);

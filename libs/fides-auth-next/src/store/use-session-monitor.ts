'use client';

import { useEffect } from 'react';
import { startSessionMonitor, type SessionMonitorConfig } from './session-monitor';
import type { createAuthStore } from './store';
import type { AuthStatus } from './types';

/**
 * React hook for session monitoring with automatic cleanup
 *
 * @param store - The auth store to update
 * @param checkAuthStatus - Function to check authentication status
 * @param config - Optional configuration
 *
 * @example
 * ```typescript
 * import { useSessionMonitor } from '@eventuras/fides-auth-next/store';
 *
 * function App() {
 *   useSessionMonitor(authStore, checkAuthStatus, {
 *     interval: 30_000,
 *     onSessionExpired: () => {
 *       toast.warn('Your session has expired');
 *     }
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSessionMonitor(
  store: ReturnType<typeof createAuthStore>,
  checkAuthStatus: () => Promise<AuthStatus>,
  config: SessionMonitorConfig = {}
): void {
  useEffect(() => {
    return startSessionMonitor(store, checkAuthStatus, config);
  }, [store, checkAuthStatus, config]);
}

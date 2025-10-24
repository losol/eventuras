'use client';

import { useEffect, useRef } from 'react';

import { checkAuth } from '@eventuras/fides-auth-next/store';
import { Logger } from '@eventuras/logger';

import { authStore } from '@/auth/authStore';
import { getAuthStatus } from '@/utils/auth/getAuthStatus';

const logger = Logger.create({
  namespace: 'web:auth',
  context: { component: 'LoginSuccessHandler' },
});

/**
 * Component that triggers immediate auth check after OAuth login redirect
 *
 * The OAuth callback redirects with ?login=success query parameter to signal
 * that login just completed. This component detects that parameter and triggers
 * an immediate auth check so the UI updates instantly (rather than waiting
 * for the 30-second polling interval).
 *
 * Place this component in the root layout so it runs on every page load.
 */
export function LoginSuccessHandler() {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only run once per page load
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Read query params directly from window.location (more reliable than useSearchParams during hydration)
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login') === 'success';

    if (loginSuccess) {
      logger.info('Login success detected via query param, triggering immediate auth check');

      // Trigger immediate check to update store
      checkAuth(authStore, getAuthStatus);

      // Clean up the URL (remove query param) without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      window.history.replaceState({}, '', url.toString());
    } else {
      logger.debug('No login success parameter found, skipping immediate check');
    }
  }, []);

  return null; // This component renders nothing
}

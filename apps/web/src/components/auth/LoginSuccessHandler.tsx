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
  // Guards against React StrictMode's intentional double-effect-invocation in
  // dev. Without it, checkAuth would fire twice on the success redirect.
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Read directly from window.location to keep this component a single
    // 'use client' island — using next/navigation's useSearchParams would
    // pull a Suspense boundary into the layout for no real benefit.
    const url = new URL(window.location.href);
    if (url.searchParams.get('login') !== 'success') return;

    logger.info('Login success detected via query param, triggering immediate auth check');

    checkAuth(authStore, getAuthStatus).catch((error: unknown) => {
      logger.error({ error }, 'Immediate auth check failed after login redirect');
    });

    // Clean up the URL without triggering navigation.
    url.searchParams.delete('login');
    window.history.replaceState({}, '', url.toString());
  }, []);

  return null;
}

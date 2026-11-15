'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { checkAuth } from '@eventuras/fides-auth/browser';
import { Logger } from '@eventuras/logger';
import { useToast } from '@eventuras/ratio-ui/toast';

import { authStore } from '@/auth/authStore';

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
 * for the 30-second polling interval). On ?login=error it shows a toast.
 *
 * Place this component in the root layout so it runs on every page load.
 */
export function LoginSuccessHandler() {
  // Guards against React StrictMode's intentional double-effect-invocation in
  // dev. Without it, checkAuth would fire twice on the success redirect.
  const hasChecked = useRef(false);
  const t = useTranslations();
  const toast = useToast();

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Read directly from window.location to keep this component a single
    // 'use client' island — using next/navigation's useSearchParams would
    // pull a Suspense boundary into the layout for no real benefit.
    const url = new URL(window.location.href);
    const login = url.searchParams.get('login');

    if (login === 'success') {
      logger.info('Login success detected via query param, triggering immediate auth check');
      checkAuth(authStore).catch((error: unknown) => {
        logger.error({ error }, 'Immediate auth check failed after login redirect');
      });
    } else if (login === 'error') {
      // fides-auth sends a failed login back with ?login=error&error=<code>.
      const code = url.searchParams.get('error');
      logger.warn({ code }, 'Login failed');
      toast.error(
        code === 'login_expired' ? t('common.auth.loginExpired') : t('common.auth.loginFailed')
      );
    } else {
      return;
    }

    // Clean up the URL without triggering navigation.
    url.searchParams.delete('login');
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());
  }, [t, toast]);

  return null;
}

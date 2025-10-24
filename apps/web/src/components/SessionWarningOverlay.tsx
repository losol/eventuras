'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { SessionWarning } from '@eventuras/ratio-ui/blocks/SessionWarning';

import { useAuthStore } from '@/auth/authStore';

const logger = Logger.create({
  namespace: 'web:components',
  context: { component: 'SessionWarningOverlay' },
});

/**
 * Session expiration overlay.
 * Shows a dialog when the session has expired and user needs to log in again.
 *
 * When the refresh token is invalid or expired, the user must go through
 * the OAuth login flow again.
 */
export function SessionWarningOverlay() {
  const t = useTranslations();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const auth = useAuthStore();

  // Check if session has expired (error contains "Session expired" or "expired" in message)
  const isSessionExpired = auth.error?.toLowerCase().includes('expired') ?? false;

  // Handle session expiration - redirect to login
  useEffect(() => {
    if (isSessionExpired) {
      logger.info('Session expired, user needs to log in again');
    }
  }, [isSessionExpired]);

  const handleLoginNow = useCallback(() => {
    logger.info('User clicked login, redirecting to login endpoint');
    setIsLoggingIn(true);

    // Capture current URL to return after login
    const returnTo = window.location.pathname + window.location.search;
    const loginUrl = `/api/login/auth0?returnTo=${encodeURIComponent(returnTo)}`;

    logger.info({ returnTo }, 'Redirecting to login with returnTo');
    window.location.href = loginUrl;
  }, []);

  const handleDismiss = useCallback(() => {
    logger.info('User dismissed session expiration warning');
    // No action needed - the store continues monitoring
  }, []);

  // Only show dialog when session is actually expired
  if (!isSessionExpired) return null;

  return (
    <SessionWarning
      isOpen={isSessionExpired}
      onLoginNow={handleLoginNow}
      onDismiss={handleDismiss}
      isLoading={isLoggingIn}
      messages={{
        title: t('common.auth.sessionWarning.title.expired'),
        description: t('common.auth.sessionWarning.description.expired'),
        tip: t('common.auth.sessionWarning.tip'),
        loginButton: t('common.auth.sessionWarning.loginNow'),
        dismissButton: t('common.buttons.cancel'),
      }}
    />
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { SessionWarning } from '@eventuras/ratio-ui/blocks/SessionWarning';

import { useAuthSelector } from '@/auth/authMachine';

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

  const { status } = useAuthSelector();

  // Handle session expiration - redirect to login
  useEffect(() => {
    if (status.isSessionExpired) {
      logger.info('Session expired, user needs to log in again');
    }
  }, [status.isSessionExpired]);

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
    // No action needed - the auth machine continues monitoring
  }, []);

  // Only show dialog when session is actually expired
  if (!status.isSessionExpired) return null;

  return (
    <SessionWarning
      isOpen={status.isSessionExpired}
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

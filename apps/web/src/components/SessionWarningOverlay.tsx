'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SessionWarning } from '@eventuras/ratio-ui/blocks/SessionWarning';
import { Logger } from '@eventuras/logger';
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
    // The /api/login route will detect and clear the invalid session
    window.location.href = '/api/login';
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
      reason="expired"
      onLoginNow={handleLoginNow}
      onDismiss={handleDismiss}
      isLoading={isLoggingIn}
      messages={{
        title: (reason) => t(`auth.sessionWarning.title.${reason}`),
        description: (reason) => t(`auth.sessionWarning.description.${reason}`),
        tip: t('auth.sessionWarning.tip'),
        loginButton: t('auth.sessionWarning.loginNow'),
        dismissButton: t('buttons.cancel'),
      }}
    />
  );
}

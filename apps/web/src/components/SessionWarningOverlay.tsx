'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { SessionWarning } from '@eventuras/ratio-ui/blocks/SessionWarning';

import { useAuthActions, useAuthStore } from '@/auth/authStore';

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
 *
 * NOTE: Only shows for users who were previously authenticated.
 * Does not show on public pages for users who were never logged in.
 */
export function SessionWarningOverlay() {
  const t = useTranslations();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  const auth = useAuthStore();
  const { clearError } = useAuthActions();

  // Track if user was previously authenticated (store in state after initial check)
  // This runs only when auth state actually changes
  const isCurrentlyAuthenticated = auth.isAuthenticated && !!auth.user;

  // Update wasAuthenticated when user becomes authenticated
  // Using useMemo or direct comparison to avoid unnecessary re-renders
  if (isCurrentlyAuthenticated && !wasAuthenticated) {
    // Use setTimeout to avoid state update during render
    Promise.resolve().then(() => setWasAuthenticated(true));
  }

  // Check if session has expired (error contains "Session expired" or "expired" in message)
  const isSessionExpired = auth.error?.toLowerCase().includes('expired') ?? false;

  // Only show warning if user was previously authenticated and session is now expired
  const shouldShowWarning = isSessionExpired && wasAuthenticated;

  // Handle session expiration - redirect to login
  useEffect(() => {
    if (shouldShowWarning) {
      logger.info('Session expired, user needs to log in again');
    }
  }, [shouldShowWarning]);

  const handleLoginNow = useCallback(() => {
    logger.info('User clicked login, redirecting to login endpoint');
    setIsLoggingIn(true);

    // Capture current URL to return after login
    const returnTo = globalThis.location.pathname + globalThis.location.search;
    const loginUrl = `/api/login/auth0?returnTo=${encodeURIComponent(returnTo)}`;

    logger.info({ returnTo }, 'Redirecting to login with returnTo');
    globalThis.location.href = loginUrl;
  }, []);

  const handleDismiss = useCallback(() => {
    logger.info('User dismissed session expiration warning');
    // Clear the error to dismiss the overlay
    clearError();
  }, [clearError]);

  // Only show dialog when session is actually expired AND user was previously authenticated
  if (!shouldShowWarning) return null;

  return (
    <SessionWarning
      isOpen={shouldShowWarning}
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

'use client';
import { useEffect } from 'react';

import {
  initializeAuth,
  startSessionMonitor,
  useHeartbeat,
} from '@eventuras/fides-auth-next/store';
import { Logger } from '@eventuras/logger';
import { ToastRenderer } from '@eventuras/ratio-ui/toast';

import { authStore, useAuthStore } from '@/auth/authStore';
import { LoginSuccessHandler } from '@/components/auth/LoginSuccessHandler';
import { SessionWarningOverlay } from '@/components/SessionWarningOverlay';
import { SentryUserContext } from '@/providers/sentry/SentryUserContext';
import { ThemeProvider } from '@/providers/theme';
import { getAuthStatus } from '@/utils/auth/getAuthStatus';

const logger = Logger.create({
  namespace: 'web:app',
  context: { component: 'Providers' },
});

type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * Activity-driven session keepalive. Lives behind an `isAuthenticated` gate so
 * we don't POST `/api/auth/heartbeat` for anonymous users (which would return
 * 401 and incorrectly mark the session as expired). On logout/expiry this
 * unmounts; on next login it remounts with a fresh effect.
 */
function HeartbeatRunner() {
  useHeartbeat({
    onSessionExpired: () => {
      logger.warn('Heartbeat detected expired refresh token');
      authStore.send({ type: 'sessionExpired' });
    },
  });
  return null;
}

export default function Providers({ children }: Readonly<ProvidersProps>) {
  const { isAuthenticated } = useAuthStore();

  // Initialize auth store and start session monitoring
  useEffect(() => {
    logger.info('Initializing auth store');

    // Initialize auth on mount
    initializeAuth(authStore, getAuthStatus);

    // Start session monitoring with cleanup
    const cleanup = startSessionMonitor(authStore, getAuthStatus, {
      interval: 30_000, // Check every 30 seconds
      onSessionExpired: () => {
        logger.warn('Session expired');
      },
    });

    // Subscribe to state changes for debugging in development
    if (process.env.NODE_ENV === 'development') {
      const subscription = authStore.subscribe(snapshot => {
        logger.debug(
          {
            context: snapshot.context,
          },
          'Auth state changed'
        );
      });

      return () => {
        logger.info('Cleaning up auth store');
        cleanup();
        subscription.unsubscribe();
      };
    }

    return cleanup;
  }, []);

  return (
    <ThemeProvider>
      <ToastRenderer />
      <LoginSuccessHandler />
      <SentryUserContext />
      <SessionWarningOverlay />
      {isAuthenticated && <HeartbeatRunner />}
      {children}
    </ThemeProvider>
  );
}

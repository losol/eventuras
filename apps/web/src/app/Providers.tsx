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
import { type Theme, ThemeProvider } from '@/providers/theme';
import { getAuthStatus } from '@/utils/auth/getAuthStatus';

const logger = Logger.create({
  namespace: 'web:app',
  context: { component: 'Providers' },
});

type ProvidersProps = {
  children: React.ReactNode;
  /** Colour scheme forced by the site or an active occasion; hides the user's toggle. */
  forcedColorScheme?: Theme | null;
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
    onEvent: event => {
      // Failures are signal; routine refreshes are noise.
      if (event.event === 'session.rejected' || event.event === 'session.refresh_failed') {
        logger.warn({ ...event }, 'Heartbeat event');
      } else {
        logger.debug({ ...event }, 'Heartbeat event');
      }
    },
  });
  return null;
}

export default function Providers({ children, forcedColorScheme }: Readonly<ProvidersProps>) {
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
      onEvent: event => {
        if (event.event === 'session.rejected' || event.event === 'session.refresh_failed') {
          logger.warn({ ...event }, 'Session monitor event');
        } else {
          logger.debug({ ...event }, 'Session monitor event');
        }
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
    <ThemeProvider forced={forcedColorScheme}>
      <ToastRenderer />
      <LoginSuccessHandler />
      <SentryUserContext />
      <SessionWarningOverlay />
      {isAuthenticated && <HeartbeatRunner />}
      {children}
    </ThemeProvider>
  );
}

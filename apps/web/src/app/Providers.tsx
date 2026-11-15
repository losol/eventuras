'use client';
import { useEffect } from 'react';

import { initializeAuth, type SessionClientEvent } from '@eventuras/fides-auth/browser';
import { useHeartbeat, useSessionMonitor } from '@eventuras/fides-auth-react';
import { Logger } from '@eventuras/logger';
import { ToastRenderer } from '@eventuras/ratio-ui/toast';

import { authStore, useAuthStore } from '@/auth/authStore';
import { fidesLogger } from '@/auth/fidesLogger';
import { LoginSuccessHandler } from '@/components/auth/LoginSuccessHandler';
import { SessionWarningOverlay } from '@/components/SessionWarningOverlay';
import { SentryUserContext } from '@/providers/sentry/SentryUserContext';
import { type Theme, ThemeProvider } from '@/providers/theme';

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
    logger: fidesLogger,
    onSessionExpired: () => {
      logger.warn('Heartbeat detected expired refresh token');
      authStore.sessionExpired();
    },
    onEvent: event => logSessionEvent(event, 'Heartbeat event'),
  });
  return null;
}

/** Failures are signal; routine refreshes are noise. */
function logSessionEvent(event: SessionClientEvent, message: string) {
  if (event.event === 'session.rejected' || event.event === 'session.refresh_failed') {
    logger.warn({ ...event }, message);
  } else {
    logger.debug({ ...event }, message);
  }
}

export default function Providers({ children, forcedColorScheme }: Readonly<ProvidersProps>) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    logger.info('Initializing auth store');
    void initializeAuth(authStore);

    if (process.env.NODE_ENV !== 'development') return;
    return authStore.subscribe(() => {
      logger.debug({ state: authStore.getSnapshot() }, 'Auth state changed');
    });
  }, []);

  useSessionMonitor(authStore, {
    interval: 30_000,
    logger: fidesLogger,
    onSessionExpired: () => logger.warn('Session expired'),
    onEvent: event => logSessionEvent(event, 'Session monitor event'),
  });

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

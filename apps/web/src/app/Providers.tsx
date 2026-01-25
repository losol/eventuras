'use client';
import { useEffect } from 'react';

import { initializeAuth, startSessionMonitor } from '@eventuras/fides-auth-next/store';
import { Logger } from '@eventuras/logger';
import { ToastRenderer, ToastsContext } from '@eventuras/toast';

import { authStore } from '@/auth/authStore';
import { LoginSuccessHandler } from '@/components/auth/LoginSuccessHandler';
import { SessionWarningOverlay } from '@/components/SessionWarningOverlay';
import { ThemeProvider } from '@/providers/theme';
import { getAuthStatus } from '@/utils/auth/getAuthStatus';

const logger = Logger.create({
  namespace: 'web:app',
  context: { component: 'Providers' },
});

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
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
      <ToastsContext.Provider>
        <ToastRenderer />
        <LoginSuccessHandler />
        <SessionWarningOverlay />
        {children}
      </ToastsContext.Provider>
    </ThemeProvider>
  );
}

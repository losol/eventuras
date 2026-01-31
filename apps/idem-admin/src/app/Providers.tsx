'use client';

import { useEffect } from 'react';

import { initializeAuth, startSessionMonitor } from '@eventuras/fides-auth-next/store';
import { Logger } from '@eventuras/logger';

import { authStore } from '@/auth/authStore';
import { getAuthStatus } from '@/utils/getAuthStatus';

const logger = Logger.create({
  namespace: 'idem-admin:app',
  context: { component: 'Providers' },
});

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    logger.info('Initializing auth store');

    initializeAuth(authStore, getAuthStatus);

    const cleanup = startSessionMonitor(authStore, getAuthStatus, {
      interval: 30_000,
      onSessionExpired: () => {
        logger.warn('Session expired');
      },
    });

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

  return <>{children}</>;
}

'use client';
import { useEffect } from 'react';

import { Logger } from '@eventuras/logger';
import { ToastRenderer, ToastsContext } from '@eventuras/toast';

import { authService } from '@/auth/authMachine';
import { LoginSuccessHandler } from '@/components/auth/LoginSuccessHandler';

const logger = Logger.create({
  namespace: 'web:app',
  context: { component: 'Providers' },
});

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  // Start the auth machine when component mounts
  useEffect(() => {
    logger.info('Starting auth machine');
    authService.start();

    // Subscribe to state changes for debugging in development
    if (process.env.NODE_ENV === 'development') {
      const subscription = authService.subscribe(state => {
        logger.debug(
          {
            state: state.value,
            context: state.context,
          },
          'Auth state changed'
        );
      });

      return () => {
        logger.info('Stopping auth machine');
        subscription.unsubscribe();
        authService.stop();
      };
    }

    return () => {
      authService.stop();
    };
  }, []);

  return (
    <ToastsContext.Provider>
      <ToastRenderer />
      <LoginSuccessHandler />
      {children}
    </ToastsContext.Provider>
  );
}

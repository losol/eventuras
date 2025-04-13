'use client';
import { useMemo } from 'react';
import { createActor } from 'xstate';

import NotificationsProvider from '@/components/NotificationsProvider';
// import NotificationsProvider from '@/components/NotificationsProvider';
import AuthenticationFlowMachine, {
  AuthenticationStateContext,
} from '@/statemachines/AuthenticationFlowMachine';
import { NotificationsContext } from '@/statemachines/NotificationsMachine';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const authService = useMemo(() => createActor(AuthenticationFlowMachine), []);
  authService.start();

  return (
    <NotificationsContext.Provider>
      <NotificationsProvider />
      <AuthenticationStateContext.Provider value={{ auth: authService }}>
        {children}
      </AuthenticationStateContext.Provider>
    </NotificationsContext.Provider>
  );
}

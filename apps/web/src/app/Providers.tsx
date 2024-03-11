'use client';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { RecoilRoot } from 'recoil';
import { createActor } from 'xstate';

import NotificationsProvider from '@/app/NotificationsProvider';
import AuthenticationFlowMachine, {
  AutheticationStateContext,
  Events,
} from '@/statemachines/AuthenticationFlowMachine';

type ProvidersProps = {
  session: Session | null;
  children: React.ReactNode;
};

export default function Providers({ children, session }: ProvidersProps) {
  const auth = useMemo(() => createActor(AuthenticationFlowMachine), []);
  auth.start();

  const sessionExists = session !== null && session !== undefined;
  useEffect(() => {
    if (sessionExists) {
      auth.send({ type: Events.ON_LOGGED_IN_SUCCESS, session });
    } else {
      auth.send({ type: Events.ON_LOGGED_OUT });
    }
  }, [sessionExists]);

  return (
    <RecoilRoot>
      <NotificationsProvider />
      <SessionProvider session={session}>
        <AutheticationStateContext.Provider value={{ auth }}>
          {children}
        </AutheticationStateContext.Provider>
      </SessionProvider>
    </RecoilRoot>
  );
}

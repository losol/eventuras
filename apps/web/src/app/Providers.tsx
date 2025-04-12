'use client';
import { useMemo } from 'react';
import { RecoilRoot } from 'recoil';
import { createActor } from 'xstate';

// import NotificationsProvider from '@/components/NotificationsProvider';
import AuthenticationFlowMachine, {
  AuthenticationStateContext,
} from '@/statemachines/AuthenticationFlowMachine';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const auth = useMemo(() => createActor(AuthenticationFlowMachine), []);
  auth.start();

  return (
    <RecoilRoot>
      {/* <NotificationsProvider /> */}
      <AuthenticationStateContext.Provider value={{ auth }}>
        {children}
      </AuthenticationStateContext.Provider>
    </RecoilRoot>
  );
}

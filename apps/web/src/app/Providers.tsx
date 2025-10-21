'use client';
import { useMemo } from 'react';
import { createActor } from 'xstate';
import AuthenticationFlowMachine, {
  AuthenticationStateContext,
} from '@/statemachines/AuthenticationFlowMachine';
import { ToastRenderer, ToastsContext } from '@eventuras/toast';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const authService = useMemo(() => createActor(AuthenticationFlowMachine), []);
  authService.start();

  return (
    <ToastsContext.Provider>
      <ToastRenderer />
      <AuthenticationStateContext.Provider value={{ auth: authService }}>
        {children}
      </AuthenticationStateContext.Provider>
    </ToastsContext.Provider>
  );
}

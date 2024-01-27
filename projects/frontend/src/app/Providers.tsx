'use client';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { RecoilRoot } from 'recoil';

import NotificationsProvider from '@/app/NotificationsProvider';
import { UserProvider } from '@/context';

type ProvidersProps = {
  session: Session | null;
  children: React.ReactNode;
};

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <RecoilRoot>
      <NotificationsProvider />
      <SessionProvider session={session}>
        <UserProvider>{children}</UserProvider>
      </SessionProvider>
    </RecoilRoot>
  );
}

'use client';
import { RecoilRoot } from 'recoil';

import NotificationsProvider from '@/components/NotificationsProvider';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <RecoilRoot>
      <NotificationsProvider />
      {children}
    </RecoilRoot>
  );
}

'use client';
import { OpenAPI } from '@losol/eventuras';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { UserProvider } from '@/context';
import Environment from '@/utils/Environment';

type ProvidersProps = {
  session: Session | null;
  children: React.ReactNode;
};

export default function Providers({ children, session }: ProvidersProps) {
  /**
   *
   * These are client-side configurations.
   * For OpenAPI configuration on the server, check out layout.tsx
   */
  OpenAPI.BASE = Environment.NEXT_PUBLIC_API_BASE_URL;
  OpenAPI.VERSION = Environment.NEXT_PUBLIC_API_VERSION;
  return (
    <SessionProvider session={session}>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}

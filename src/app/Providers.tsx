'use client';
import { OpenAPI } from '@losol/eventuras';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { UserProvider } from '@/context';

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
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  OpenAPI.VERSION = process.env.NEXT_PUBLIC_API_VERSION!;
  return (
    <SessionProvider session={session}>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}

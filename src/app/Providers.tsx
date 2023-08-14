'use client';
import { OpenAPI } from '@losol/eventuras';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

type ProvidersProps = {
  session: Session | null;
  children: React.ReactNode;
};

/**
 *
 * These are client-side configurations.
 * For OpenAPI configuration on the server, check out layout.tsx
 */
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
OpenAPI.VERSION = process.env.NEXT_PUBLIC_API_VERSION!;

export default function Providers({ session, children }: ProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

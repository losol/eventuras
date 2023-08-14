import '@/styles/globals.css';

import { OpenAPI } from '@losol/eventuras';
import type { Metadata } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';

import Providers from './Providers';

export const metadata: Metadata = {
  title: 'Eventuras',
  description: 'A life with eventuras',
};

// Forces dynamic site generation
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session: Session | null = await getServerSession(authOptions);
  /**
   *
   * These are server-side configurations, not available client-side.
   * For OpenAPI configuration on the client, check out providers.tsx
   */

  OpenAPI.BASE = process.env.API_BASE_URL!;
  OpenAPI.VERSION = process.env.NEXT_PUBLIC_API_VERSION!;
  OpenAPI.TOKEN = session?.accessToken ?? '';
  const strippedSession = { ...session, accessToken: undefined } as Session;

  return (
    <html lang="en">
      <body>
        <Providers session={strippedSession}>{children}</Providers>
      </body>
    </html>
  );
}

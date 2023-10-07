import '@/styles/globals.css';

import { OpenAPI } from '@losol/eventuras';
import type { Metadata } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';
import Environment, { EnvironmentVariables } from '@/utils/Environment';

import Providers from './Providers';

export const metadata: Metadata = {
  title: 'Eventuras',
  description: 'A life with eventuras',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session: Session | null = await getServerSession(authOptions);
  Environment.validate();
  /**
   *
   * These are server-side configurations, not available client-side.
   * For OpenAPI configuration on the client, check out providers.tsx
   */

  OpenAPI.BASE = Environment.get(EnvironmentVariables.API_BASE_URL);
  OpenAPI.VERSION = Environment.NEXT_PUBLIC_API_VERSION;

  return (
    <html lang="en">
      <body>
        <Providers session={session}> {children}</Providers>
      </body>
    </html>
  );
}

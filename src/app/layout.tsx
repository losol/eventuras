import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';
import Environment from '@/utils/Environment';

import Providers from './Providers';

export const metadata: Metadata = {
  title: 'Eventuras',
  description: 'A life with eventuras',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session: Session | null = await getServerSession(authOptions);
  Environment.validate();

  return (
    <html lang="en">
      <body>
        <Providers session={session}> {children}</Providers>
      </body>
    </html>
  );
}

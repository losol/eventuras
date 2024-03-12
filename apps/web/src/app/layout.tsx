import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';
import Environment from '@/utils/Environment';
import getSiteSettings from '@/utils/site/getSiteSettings';

import Wrapper from '../components/eventuras/Wrapper';
import Providers from './Providers';

const siteSettings = await getSiteSettings();
export const metadata: Metadata = {
  title: {
    template: `%s | ${siteSettings?.name ?? 'Eventuras'}`,
    default: siteSettings?.name ?? 'Eventuras',
  },
  description: siteSettings?.description ?? 'A life with eventuras',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session: Session | null = await getServerSession(authOptions);
  Environment.validate();

  return (
    <html lang={Environment.NEXT_PUBLIC_DEFAULT_LOCALE}>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}

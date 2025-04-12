import '@eventuras/ui/style.css';
import '@/styles/globals.css';

import type { Metadata } from 'next';

import Environment from '@/utils/Environment';
import getSiteSettings from '@/utils/site/getSiteSettings';

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
  Environment.validate();

  return (
    <html lang={Environment.NEXT_PUBLIC_DEFAULT_LOCALE}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

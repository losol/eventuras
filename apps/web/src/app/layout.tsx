import '@eventuras/ratio-ui/ui.css';

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

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
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import '@eventuras/ratio-ui/ratio-ui.css';

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

import getSiteSettings from '@/utils/site/getSiteSettings';
import { configureEventurasClient } from '@/lib/eventuras-client';

import Providers from './Providers';

// Configure the Eventuras API client on app startup
await configureEventurasClient();

const siteSettings = await getSiteSettings();
export const metadata: Metadata = {
  title: {
    template: `%s | ${siteSettings?.name ?? 'Eventuras'}`,
    default: siteSettings?.name ?? 'Eventuras',
  },
  description: siteSettings?.description ?? 'A life with eventuras',
};

/**
 * Root Layout - Minimal wrapper providing html/body structure
 * Actual navbar/footer are in route group layouts
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

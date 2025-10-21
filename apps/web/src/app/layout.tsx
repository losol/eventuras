import '@eventuras/ratio-ui/ratio-ui.css';

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';
import { Footer } from '@eventuras/ratio-ui/core/Footer';
import { List } from '@eventuras/ratio-ui/core/List';

import getSiteSettings from '@/utils/site/getSiteSettings';
import { configureEventurasClient } from '@/lib/eventuras-client';
import UserMenu from '@/components/eventuras/UserMenu';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const site = await getSiteSettings();
  const t = await getTranslations();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Providers>
            {/* Navbar and Footer are now in the root layout - shared across all pages */}
            <Navbar
              title={site?.name ?? 'Eventuras'}
              bgColor="bg-transparent w-full py-1"
              LinkComponent={Link}
            >
              <UserMenu
                translations={{
                  loginLabel: t('common.labels.login'),
                  accountLabel: t('common.labels.account'),
                  adminLabel: t('common.labels.admin'),
                  userLabel: t('common.labels.user'),
                }}
              />
            </Navbar>

            {/* Main content - container class can be overridden in nested layouts */}
            <main id="main-content" className="container mx-auto">
              {children}
            </main>

            <Footer siteTitle={site?.name} publisher={site?.publisher}>
              <List className="list-none text-gray-800 dark:text-gray-300 font-medium">
                {site?.footerLinks?.map((link, idx) => (
                  <List.Item key={link.href ?? idx} className="mb-4">
                    <Link href={link.href}>{link.text}</Link>
                  </List.Item>
                ))}
              </List>
            </Footer>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

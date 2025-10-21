import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Footer } from '@eventuras/ratio-ui/core/Footer';
import { List } from '@eventuras/ratio-ui/core/List';
import { Navbar } from '@eventuras/ratio-ui/core/Navbar';

import UserMenu from '@/components/eventuras/UserMenu';
import getSiteSettings from '@/utils/site/getSiteSettings';

/**
 * (admin) Route Group Layout
 * For admin area: /admin/*
 * Includes navbar and footer with container-wrapped content
 * Requires admin authentication
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const site = await getSiteSettings();
  const t = await getTranslations();

  return (
    <>
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
    </>
  );
}

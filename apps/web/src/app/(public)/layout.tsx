import type { ReactNode } from 'react';
import Link from 'next/link';

import { Footer } from '@eventuras/ratio-ui/core/Footer';
import { List } from '@eventuras/ratio-ui/core/List';

import SiteNavbar from '@/components/eventuras/SiteNavbar';
import getSiteSettings from '@/utils/site/getSiteSettings';

/**
 * (public) Route Group Layout
 * For publicly accessible pages: /collections, /events
 * Includes navbar and footer with container-wrapped content
 */
export default async function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  const site = await getSiteSettings();

  return (
    <>
      <SiteNavbar />

      <main id="main-content">{children}</main>

      <Footer.Classic siteTitle={site?.name} publisher={site?.publisher}>
        <List className="list-none text-gray-800 dark:text-gray-300 font-medium">
          {site?.footerLinks?.map((link, idx) => (
            <List.Item key={link.href ?? idx} className="mb-4">
              <Link href={link.href}>{link.text}</Link>
            </List.Item>
          ))}
        </List>
      </Footer.Classic>
    </>
  );
}

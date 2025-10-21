import type { ReactNode } from 'react';
import Link from 'next/link';

import { Footer } from '@eventuras/ratio-ui/core/Footer';
import { List } from '@eventuras/ratio-ui/core/List';

import getSiteSettings from '@/utils/site/getSiteSettings';

/**
 * (frontpage) Route Group Layout
 * For homepage (/) only
 * No navbar - Hero component has integrated user menu
 * Full-width content for hero section
 */
export default async function FrontpageLayout({ children }: { children: ReactNode }) {
  const site = await getSiteSettings();

  return (
    <>
      <main id="main-content" className="w-full">
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

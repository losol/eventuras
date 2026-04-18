import type { ReactNode } from 'react';
import Link from 'next/link';

import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';
import { Footer } from '@eventuras/ratio-ui/core/Footer';
import { List } from '@eventuras/ratio-ui/core/List';

import SiteNavbar from '@/components/eventuras/SiteNavbar';
import { checkAuthorization } from '@/utils/auth/checkAuthorization';
import getSiteSettings from '@/utils/site/getSiteSettings';

// Force dynamic rendering for all admin routes since they use authentication
export const dynamic = 'force-dynamic';

/**
 * (admin) Route Group Layout
 * For admin area: /admin/*
 * Includes navbar and footer with container-wrapped content
 * Requires admin authentication - all routes under /admin/* require 'Admin' role
 * Individual pages can add stricter role requirements if needed
 */
export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Check base Admin role for all admin routes
  const authResult = await checkAuthorization('Admin');

  if (!authResult.authorized) {
    return <Unauthorized />;
  }

  const site = await getSiteSettings();

  return (
    <>
      <SiteNavbar />

      <main id="main-content">{children}</main>

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

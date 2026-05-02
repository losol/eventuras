import type { ReactNode } from 'react';

import SiteFooter from '@/components/eventuras/SiteFooter';
import SiteNavbar from '@/components/eventuras/SiteNavbar';

// Force dynamic rendering for all user routes since they use authentication
export const dynamic = 'force-dynamic';

/**
 * (user) Route Group Layout
 * For user area: /user/*
 * Includes navbar and footer with container-wrapped content
 * Requires authentication
 */
export default function UserLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteNavbar />

      <main id="main-content">{children}</main>

      <SiteFooter />
    </>
  );
}

import type { ReactNode } from 'react';

import SiteFooter from '@/components/eventuras/SiteFooter';
import SiteNavbar from '@/components/eventuras/SiteNavbar';

/**
 * (public) Route Group Layout
 * For publicly accessible pages: /collections, /events
 * Includes navbar and footer with container-wrapped content
 */
export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteNavbar />

      <main id="main-content">{children}</main>

      <SiteFooter />
    </>
  );
}

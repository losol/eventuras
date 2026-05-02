import type { ReactNode } from 'react';

import SiteFooter from '@/components/eventuras/SiteFooter';

/**
 * (frontpage) Route Group Layout
 * For homepage (/) only
 * No navbar - Hero component has integrated user menu
 * Full-width content for hero section
 */
export default function FrontpageLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main id="main-content" className="w-full">
        {children}
      </main>

      <SiteFooter />
    </>
  );
}

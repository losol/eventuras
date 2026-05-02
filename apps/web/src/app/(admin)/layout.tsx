import type { ReactNode } from 'react';

import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';

import SiteFooter from '@/components/eventuras/SiteFooter';
import SiteNavbar from '@/components/eventuras/SiteNavbar';
import { checkAuthorization } from '@/utils/auth/checkAuthorization';

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

  return (
    <>
      <SiteNavbar />

      <main id="main-content">{children}</main>

      <SiteFooter />
    </>
  );
}

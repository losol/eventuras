import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';

import { AdminShell } from '@/components/admin/shell';
import SiteNavbar from '@/components/eventuras/SiteNavbar';
import { checkAuthorization } from '@/utils/auth/checkAuthorization';

// Force dynamic rendering for all admin routes since they use authentication
export const dynamic = 'force-dynamic';

/**
 * (admin) Route Group Layout
 * For admin area: /admin/*
 * Site navbar on top, then the admin shell: sidebar navigation beside the page content.
 * Requires admin authentication - all routes under /admin/* require 'Admin' role
 * Individual pages can add stricter role requirements if needed
 */
export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Check base Admin role for all admin routes
  const authResult = await checkAuthorization('Admin');

  if (!authResult.authorized) {
    return <Unauthorized />;
  }

  const t = await getTranslations();

  return (
    <>
      <SiteNavbar />
      <AdminShell title={t('admin.title')} menuLabel={t('common.labels.menu')}>
        {children}
      </AdminShell>
    </>
  );
}

import React from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { Gutter } from '@payloadcms/ui';
import { redirect } from 'next/navigation';
import type { AdminViewServerProps } from 'payload';

import { SalesReportView } from './SalesReportView';

export default function SalesReportPage({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    permissions,
    req: { payload, user, i18n },
    visibleEntities,
    locale,
  } = initPageResult;

  if (!user || !permissions?.canAccessAdmin) {
    redirect('/admin/unauthorized');
  }

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <SalesReportView />
      </Gutter>
    </DefaultTemplate>
  );
}

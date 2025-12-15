import { getTranslations } from 'next-intl/server';

import { AdminEventListClient } from './AdminEventListClient';
import { fetchEvents } from './eventActions';

interface AdminEventListProps {
  organizationId: number;
  includePastEvents?: boolean;
  pageSize?: number;
  page?: number;
}

function aMonthAgo(): string {
  const today = new Date();
  const monthAgo = new Date(today.setDate(today.getDate() - 31)).toISOString().split('T')[0];
  return monthAgo!;
}

/**
 * Server Component that fetches events and passes data to client component
 */
const AdminEventList = async ({
  organizationId,
  includePastEvents = false,
  pageSize = 25,
  page = 1,
}: AdminEventListProps) => {
  const t = await getTranslations();

  // Fetch data (errors will be caught by error boundary)
  const result = await fetchEvents({
    organizationId,
    includePastEvents,
    page,
    pageSize,
    startDate: includePastEvents ? undefined : aMonthAgo(),
    ordering: includePastEvents ? ['DateStart:desc'] : ['DateStart:asc'],
  });

  return (
    <AdminEventListClient
      events={result.data}
      currentPage={page}
      totalPages={result.pages}
      pageSize={pageSize}
      translations={{
        title: t('admin.eventColumns.title'),
        location: t('admin.eventColumns.location'),
        when: t('admin.eventColumns.when'),
        actions: t('admin.eventColumns.actions'),
        view: t('common.labels.view'),
      }}
    />
  );
};

export default AdminEventList;

'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { EventDto } from '@eventuras/event-sdk';
import { Loading, Pagination } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { Link } from '@eventuras/ratio-ui-next/Link';
import { fetchEvents } from './eventActions';

const columnHelper = createColumnHelper<EventDto>();
interface AdminEventListProps {
  organizationId: number;
  includePastEvents?: boolean;
  pageSize?: number;
}

const AdminEventList: React.FC<AdminEventListProps> = ({
  organizationId,
  includePastEvents = false,
  pageSize = 25,
}) => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ data: EventDto[]; pages: number } | null>(null);

  function aMonthAgo(): string {
    const today = new Date();
    const monthAgo = new Date(today.setDate(today.getDate() - 31)).toISOString().split('T')[0];
    return monthAgo!;
  }

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const result = await fetchEvents({
          organizationId,
          includePastEvents,
          page,
          pageSize,
          startDate: includePastEvents ? undefined : aMonthAgo(),
        });

        setResult({
          data: result.data,
          pages: result.pages,
        });
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [organizationId, includePastEvents, page, pageSize]);

  const renderEventItemActions = (info: EventDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/events/${info.id}`}>
          {t('common.labels.view')}
        </Link>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('title', {
      header: t('admin.eventColumns.title').toString(),
      cell: info => <Link href={`/admin/events/${info.row.original.id}`}> {info.getValue()}</Link>,
    }),
    columnHelper.accessor('location', {
      header: t('admin.eventColumns.location').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('dateStart', {
      header: t('admin.eventColumns.when').toString(),
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('id', {
      header: t('admin.eventColumns.actions').toString(),
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];

  if (loading) return <Loading />;

  if (!result) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">No response from admin events</h3>
        <p className="mt-2 text-sm text-red-700">Response is null</p>
      </div>
    );
  }

  return (
    <>
      <DataTable data={result.data} columns={columns} pageSize={pageSize} />
      <Pagination
        currentPage={page}
        totalPages={result.pages}
        onPreviousPageClick={() => setPage(page - 1)}
        onNextPageClick={() => setPage(page + 1)}
      />
    </>
  );
};

export default AdminEventList;

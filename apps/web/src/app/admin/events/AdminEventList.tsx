'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { EventDto } from '@eventuras/sdk';
import FatalError from '@eventuras/ui/FatalError';
import Link from '@eventuras/ui/Link';
import Loading from '@eventuras/ui/Loading';
import Pagination from '@eventuras/ui/Pagination';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';
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
  const { t } = createTranslation();
  const [page, setPage] = useState(1);
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const { loading, result } = useCreateHook(
    () =>
      sdk.events.getV3Events({
        organizationId,
        includeDraftEvents: true,
        includePastEvents: includePastEvents,
        page,
        count: pageSize,
      }),
    [page]
  );

  const renderEventItemActions = (info: EventDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/events/${info.id}`}>
          {t('common:labels.view')}
        </Link>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('title', {
      header: t('admin:eventColumns.title').toString(),
      cell: info => <Link href={`/admin/events/${info.row.original.id}`}> {info.getValue()}</Link>,
    }),
    columnHelper.accessor('location', {
      header: t('admin:eventColumns.location').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('dateStart', {
      header: t('admin:eventColumns.when').toString(),
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('action', {
      header: t('admin:eventColumns.actions').toString(),
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];

  if (loading) return <Loading />;
  if (!result)
    return <FatalError title="No response from admin events" description="Response is null" />;
  return (
    <>
      <DataTable data={result.data ?? []} columns={columns} pageSize={pageSize} />
      <Pagination
        currentPage={page}
        totalPages={result.pages ?? 0}
        onPreviousPageClick={() => setPage(page - 1)}
        onNextPageClick={() => setPage(page + 1)}
      />
    </>
  );
};

export default AdminEventList;

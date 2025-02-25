'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { PeriodMatchingKind } from '@eventuras/sdk';
import { EventDto } from '@eventuras/sdkv2/models/components/eventdto';
import { RFCDate } from '@eventuras/sdkv2/types/rfcdate';
import { Loading, Pagination } from '@eventuras/ui';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import FatalError from '@/components/FatalError';
import Link from '@/components/Link';
import useCreateHook from '@/hooks/createHook';
import { createSDKV2 } from '@/utils/api/EventurasApi';
const columnHelper = createColumnHelper<EventDto>();
interface AdminEventListProps {
  organizationId: number;
  includePastEvents?: boolean;
  pageSize?: number;
}

const parseDate = (date?: RFCDate | null): string => {
  if (!date) return '-';
  return `${date.toString()}`;
};

const AdminEventList: React.FC<AdminEventListProps> = ({
  organizationId,
  includePastEvents = false,
  pageSize = 25,
}) => {
  const { t } = createTranslation();
  const [page, setPage] = useState(1);
  const sdk = createSDKV2({ inferUrl: { enabled: true, requiresToken: true } });
  function aMonthAgo(): string {
    const today = new Date();
    const weekAgo = new Date(today.setDate(today.getDate() - 31)).toISOString().split('T')[0];
    return weekAgo!;
  }

  const { loading, result } = useCreateHook(
    () =>
      sdk.events.getV3Events({
        organizationId,
        includeDraftEvents: true,
        includePastEvents: includePastEvents,
        start: includePastEvents ? undefined : new RFCDate(aMonthAgo()),
        period: PeriodMatchingKind.CONTAIN,
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
      cell: info => parseDate(info.getValue()),
      enableSorting: true,
    }),
    columnHelper.accessor('id', {
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
      <p>{result.data?.length}</p>
    </>
  );
};

export default AdminEventList;

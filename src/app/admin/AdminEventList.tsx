'use client';

import { EventDto } from '@losol/eventuras';
import { IconEditCircle, IconMailForward } from '@tabler/icons-react';
import Link from 'next/link';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import EventEmailer from '@/components/event/EventEmailer';
import { Drawer } from '@/components/ui';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import FatalError from '@/components/ui/FatalError';
import Loading from '@/components/ui/Loading';
import Pagination from '@/components/ui/Pagination';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';
const columnHelper = createColumnHelper<EventDto>();
interface AdminEventListProps {
  organizationId: number;
}

const AdminEventList: React.FC<AdminEventListProps> = ({ organizationId }) => {
  const { t } = createTranslation();
  const [page, setPage] = useState(1);
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const pageSize = 25;
  const { loading, result } = useCreateHook(
    () =>
      sdk.events.getV3Events({
        organizationId,
        includeDraftEvents: true,
        includePastEvents: true,
        page,
        count: pageSize,
      }),
    [page]
  );

  const [eventOpened, setEventOpened] = useState<EventDto | null>(null);

  const renderEventItemActions = (info: EventDto) => {
    return (
      <div className="flex flex-row">
        <IconMailForward className="cursor-pointer m-1" onClick={() => setEventOpened(info)} />
        <Link className="m-1" href={`/admin/events/${info.id}/edit`}>
          <IconEditCircle />
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
  const drawerIsOpen = eventOpened !== null;

  if (loading) return <Loading />;
  if (!result)
    return <FatalError title="No response from admin events" description="Response is null" />;
  return (
    <>
      <DataTable data={result.data ?? []} columns={columns} />
      <Pagination
        currentPage={page}
        totalPages={result.pages ?? 0}
        onPreviousPageClick={() => setPage(page - 1)}
        onNextPageClick={() => setPage(page + 1)}
      />
      {eventOpened !== null && (
        <Drawer isOpen={drawerIsOpen} onCancel={() => setEventOpened(null)}>
          <Drawer.Header as="h3" className="text-black">
            {t('admin:eventEmailer.title')}
          </Drawer.Header>
          <Drawer.Body>
            <EventEmailer
              eventTitle={eventOpened.title!}
              eventId={eventOpened.id!}
              onClose={() => setEventOpened(null)}
            />
          </Drawer.Body>
          <Drawer.Footer>
            <></>
          </Drawer.Footer>
        </Drawer>
      )}
    </>
  );
};

export default AdminEventList;

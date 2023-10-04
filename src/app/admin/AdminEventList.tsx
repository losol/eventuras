'use client';

import { EventDto } from '@losol/eventuras';
import { IconEditCircle, IconMailForward } from '@tabler/icons-react';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import EventEmailer from '@/components/event/EventEmailer';
import { Drawer } from '@/components/ui';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
const columnHelper = createColumnHelper<EventDto>();
interface AdminEventListProps {
  eventinfo: EventDto[];
}

const AdminEventList: React.FC<AdminEventListProps> = ({ eventinfo = [] }) => {
  const { t } = useTranslation('admin');
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
      header: t('eventColumns.title').toString(),
      cell: info => <Link href={`/admin/events/${info.row.original.id}`}> {info.getValue()}</Link>,
    }),
    columnHelper.accessor('location', {
      header: t('eventColumns.location').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('dateStart', {
      header: t('eventColumns.when').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('action', {
      header: t('eventColumns.actions').toString(),
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];
  const drawerIsOpen = eventOpened !== null;
  return (
    <>
      <DataTable
        data={eventinfo}
        columns={columns}
        clientsidePaginationPageSize={250}
        clientsidePagination
      />
      {eventOpened !== null && (
        <Drawer isOpen={drawerIsOpen} onCancel={() => setEventOpened(null)}>
          <Drawer.Header as="h3" className="text-black">
            {t('eventEmailer.title')}
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

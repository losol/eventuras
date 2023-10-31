'use client';

import { EventDto, RegistrationDto } from '@losol/eventuras';
import { IconMailForward } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import EventEmailer from '@/components/event/EventEmailer';
//import EventEmailer from '@/components/event/EventEmailer';
import { Drawer } from '@/components/ui';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
const columnHelper = createColumnHelper<RegistrationDto>();
interface AdminEventListProps {
  participants: RegistrationDto[];
  event: EventDto;
}

const EventParticipantList: React.FC<AdminEventListProps> = ({ participants = [], event }) => {
  const { t } = useTranslation();
  const [registrationOpened, setRegistrationOpened] = useState<RegistrationDto | null>(null);

  const renderEventItemActions = (info: RegistrationDto) => {
    return (
      <div className="flex flex-row">
        <IconMailForward
          className="cursor-pointer m-1"
          onClick={() => setRegistrationOpened(info)}
        />
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('name', {
      header: t('admin:participantColumns.name').toString(),
      cell: info => info.row.original.user?.name,
    }),
    columnHelper.accessor('telephone', {
      header: t('admin:participantColumns.telephone').toString(),
      cell: info => info.row.original.user?.phoneNumber,
    }),
    columnHelper.accessor('status', {
      header: t('admin:participantColumns.status').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('type', {
      header: t('admin:participantColumns.type').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('actions', {
      header: t('admin:participantColumns.actions').toString(),
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];
  const drawerIsOpen = registrationOpened !== null;
  return (
    <>
      <DataTable
        data={participants}
        columns={columns}
        clientsidePaginationPageSize={250}
        clientsidePagination
      />
      {registrationOpened !== null && (
        <Drawer isOpen={drawerIsOpen} onCancel={() => setRegistrationOpened(null)}>
          <Drawer.Header as="h3" className="text-black">
            <p>Mailer</p>
          </Drawer.Header>
          <Drawer.Body>
            <EventEmailer
              eventTitle={event.title!}
              eventId={event.id!}
              onClose={() => setRegistrationOpened(null)}
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

export default EventParticipantList;

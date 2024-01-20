'use client';

import { EventDto, ProductDto, RegistrationDto } from '@losol/eventuras';
import { IconNotes, IconShoppingCart, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import EventEmailer from '@/components/event/EventEmailer';
import EditEventRegistrationsDialog from '@/components/eventuras/EditEventRegistrationDialog';
import { Drawer } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import Loading from '@/components/ui/Loading';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';

import LiveActionsMenu from './LiveActionsMenu';

const columnHelper = createColumnHelper<RegistrationDto>();
interface AdminEventListProps {
  participants: RegistrationDto[];
  event: EventDto;
  eventProducts?: ProductDto[];
}

const EventParticipantList: React.FC<AdminEventListProps> = ({
  participants: initialParticipants = [],
  event,
  eventProducts = [],
}) => {
  const { t } = createTranslation();
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

  const [participants, setParticipants] = useState<RegistrationDto[]>(initialParticipants);
  const [registrationOpen, setRegistrationOpen] = useState<RegistrationDto | null>(null);
  const [currentSelectedParticipant, setCurrentSelectedParticipant] =
    useState<RegistrationDto | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const updateParticipantList = (updatedRegistration: RegistrationDto) => {
    setParticipants(prevParticipants =>
      prevParticipants.map(participant =>
        participant.registrationId === updatedRegistration.registrationId
          ? updatedRegistration
          : participant
      )
    );
  };

  const { result: currentRegistration, loading: loadingRegistration } = useCreateHook(
    () => {
      Logger.info({ namespace: 'admin:eventparticipantlist' }, 'Loading current registrations');
      return sdk.registrations.getV3Registrations1({
        id: currentSelectedParticipant!.registrationId!,
        includeProducts: true,
        includeOrders: true,
        includeUserInfo: true,
      });
    },
    [currentSelectedParticipant?.registrationId],
    () => currentSelectedParticipant === null
  );

  const renderLiveActions = (registration: RegistrationDto) => {
    return <LiveActionsMenu registration={registration} onStatusUpdate={updateParticipantList} />;
  };

  const renderEventItemActions = (info: RegistrationDto) => {
    return (
      <div className="flex flex-col items-end">
        <div className="flex flex-row">
          <div className="mr-2">
            <Button variant="light">
              <Link href={`/admin/users/${info.userId}`}>
                <IconUser color="black" />
              </Link>
            </Button>
          </div>
          <div className="mr-2">
            <Button variant="light">
              <Link href={`/admin/registrations/${info.registrationId}`}>
                <IconNotes color="black" />
              </Link>
            </Button>
          </div>
          {eventProducts?.length !== 0 && (
            <Button
              variant="light"
              onClick={() => {
                setCurrentSelectedParticipant(info);
                setEditorOpen(true);
              }}
            >
              {!currentRegistration &&
              loadingRegistration &&
              currentSelectedParticipant !== null &&
              currentSelectedParticipant.userId === info.userId ? (
                <Loading />
              ) : (
                <IconShoppingCart color="black" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  function renderProducts(registration: RegistrationDto) {
    if (!registration.products || registration.products.length === 0) {
      return '';
    }

    return registration.products
      .map(product => {
        const displayQuantity = product.product!.enableQuantity && product.quantity! > 1;
        return displayQuantity
          ? `${product.quantity} x ${product.product!.name}`
          : product.product!.name;
      })
      .join(', ');
  }

  const columns = [
    columnHelper.accessor('name', {
      header: t('admin:participantColumns.name').toString(),
      cell: info => info.row.original.user?.name,
    }),
    columnHelper.accessor('telephone', {
      header: t('admin:participantColumns.telephone').toString(),
      cell: info => info.row.original.user?.phoneNumber,
    }),
    columnHelper.accessor('email', {
      header: t('admin:participantColumns.email').toString(),
      cell: info => info.row.original.user?.email,
    }),
    columnHelper.accessor('products', {
      header: t('admin:participantColumns.products').toString(),
      cell: info => renderProducts(info.row.original),
    }),
    columnHelper.accessor('type', {
      header: t('admin:participantColumns.status').toString(),
      cell: info => {
        const registration = info.row.original;
        return (
          <>
            <Badge>{registration.type}</Badge>
            &nbsp;
            <Badge>{registration.status}</Badge>
          </>
        );
      },
    }),
    columnHelper.accessor('live', {
      header: t('admin:participantColumns.live'),
      cell: info => renderLiveActions(info.row.original),
    }),
    columnHelper.accessor('actions', {
      header: t('admin:participantColumns.actions').toString(),
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];
  const drawerIsOpen = registrationOpen !== null;
  return (
    <>
      <DataTable data={participants} columns={columns} pageSize={250} clientsidePagination />
      {registrationOpen !== null && (
        <Drawer isOpen={drawerIsOpen} onCancel={() => setRegistrationOpen(null)}>
          <Drawer.Header as="h3" className="text-black">
            <p>Mailer</p>
          </Drawer.Header>
          <Drawer.Body>
            <EventEmailer
              eventTitle={event.title!}
              eventId={event.id!}
              onClose={() => setRegistrationOpen(null)}
            />
          </Drawer.Body>
          <Drawer.Footer>
            <></>
          </Drawer.Footer>
        </Drawer>
      )}

      {currentRegistration && eventProducts && editorOpen && (
        <EditEventRegistrationsDialog
          eventProducts={eventProducts}
          currentRegistration={currentRegistration}
          startOpened={true}
          withButton={false}
          title={currentRegistration.user?.name ?? undefined}
          description={`Edit products for user ${currentRegistration.user?.email}`}
          onClose={(registrationUpdated: boolean) => {
            if (registrationUpdated) {
              //force reload of participant data along with registration
              setCurrentSelectedParticipant(null);
            }
            setEditorOpen(false);
          }}
        />
      )}
    </>
  );
};

export default EventParticipantList;

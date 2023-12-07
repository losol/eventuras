'use client';

import { EventDto, RegistrationDto } from '@losol/eventuras';
import { IconEditCircle, IconMailForward } from '@tabler/icons-react';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import EventEmailer from '@/components/event/EventEmailer';
import EditEventRegistrationsDialog from '@/components/eventuras/EditEventRegistrationDialog';
import { Drawer } from '@/components/ui';
import Button from '@/components/ui/Button';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import Loading from '@/components/ui/Loading';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';

const columnHelper = createColumnHelper<RegistrationDto>();
interface AdminEventListProps {
  participants: RegistrationDto[];
  event: EventDto;
}

const EventParticipantList: React.FC<AdminEventListProps> = ({ participants = [], event }) => {
  const { t } = createTranslation();
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

  const [registrationOpen, setRegistrationOpen] = useState<RegistrationDto | null>(null);
  const [currentSelectedParticipant, setCurrentSelectedParticipant] =
    useState<RegistrationDto | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const { result: availableProducts } = useCreateHook(
    () => {
      return sdk.eventProducts.getV3EventsProducts({ eventId: event.id! });
    },
    [event.id],
    (): boolean => event === null || availableProducts !== null
  );

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

  const renderEventItemActions = (info: RegistrationDto) => {
    return (
      <div className="flex flex-col items-end">
        <div className="flex flex-row">
          <div className="mr-2">
            <Button variant="light">
              <IconMailForward color="black" onClick={() => setRegistrationOpen(info)} />
            </Button>
          </div>
          {availableProducts?.length !== 0 && (
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
                <IconEditCircle color="black" />
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
    columnHelper.accessor('status', {
      header: t('admin:participantColumns.status').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('products', {
      header: t('admin:participantColumns.products').toString(),
      cell: info => renderProducts(info.row.original),
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

      {currentRegistration && availableProducts && editorOpen && (
        <EditEventRegistrationsDialog
          availableProducts={availableProducts}
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

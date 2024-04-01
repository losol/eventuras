'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { EventDto, ProductDto, RegistrationDto } from '@eventuras/sdk';
import { Drawer } from '@eventuras/ui';
import { Badge } from '@eventuras/ui';
import { Loading } from '@eventuras/ui';
import { Button } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { IconNotes, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { ColumnFilter } from '@tanstack/react-table';
import Link from 'next/link';
import createTranslation from 'next-translate/createTranslation';
import React, { useMemo, useState } from 'react';

import EventNotificator, { EventNotificatorType } from '@/components/event/EventNotificator';
import EditRegistrationProductsDialog from '@/components/eventuras/EditRegistrationProductsDialog';
import useCreateHook from '@/hooks/createHook';
import { ParticipationTypesKey } from '@/types';
import { createSDK } from '@/utils/api/EventurasApi';
import { participationMap } from '@/utils/api/mappers';

import LiveActionsMenu from './LiveActionsMenu';

const columnHelper = createColumnHelper<RegistrationDto>();

interface AdminEventListProps {
  participants: RegistrationDto[];
  event: EventDto;
  eventProducts?: ProductDto[];
  filteredStatus?: string;
  onUpdated?: () => void;
}

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

const EventParticipantList: React.FC<AdminEventListProps> = ({
  participants: initialParticipants = [],
  event,
  eventProducts = [],
  filteredStatus,
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

  /**
   * To allow tanstack to filter or sort or do any sort of computation it needs a properly formed *accessor key* which is
   * a string or a function which will tell tanstack where to get its data from.
   */
  const columns = [
    columnHelper.display({
      header: t('common:labels.id').toString(),
      cell: info => <Badge>{info.row.original.registrationId}</Badge>,
    }),
    columnHelper.accessor('user.name', {
      header: t('admin:participantColumns.name').toString(),
    }),

    columnHelper.accessor('user.phoneNumber', {
      header: t('admin:participantColumns.telephone').toString(),
    }),
    columnHelper.accessor('user.email', {
      header: t('admin:participantColumns.email').toString(),
    }),
    columnHelper.accessor('products', {
      header: t('admin:participantColumns.products').toString(),
      cell: info => renderProducts(info.row.original),
    }),
    columnHelper.accessor('status', {
      header: t('admin:participantColumns.status').toString(),
      filterFn: (row, _columnId, value) => {
        /*
          This filters out participants based on status. The filter assumes values of 'participant,waitinglist,cancelled'
          Status types are mapped accordingly, as the actual RegistrationStatus could be verified,draft[...],waitinglist,cancelled,
          This filter maps the given value to the actual registrationstatus and returns true if the status mapping returns a hit.
        */
        const status = row.original.status!;
        const key = Object.keys(participationMap).filter(key => {
          const k = key as ParticipationTypesKey;
          const values: string[] = participationMap[k];
          return values.indexOf(status) > -1;
        })[0];
        return key?.toLowerCase() === value.toLowerCase();
      },
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
    columnHelper.display({
      id: 'live',
      header: t('admin:participantColumns.live'),
      cell: info => renderLiveActions(info.row.original),
    }),
    columnHelper.display({
      id: 'actions',
      header: t('admin:participantColumns.actions').toString(),
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];
  const drawerIsOpen = registrationOpen !== null;
  const columnFilter: ColumnFilter[] = useMemo(() => {
    if (!filteredStatus) return [];
    return [
      {
        id: 'status',
        value: filteredStatus,
      },
    ];
  }, [filteredStatus]);

  return (
    <>
      <DataTable
        data={participants}
        columns={columns}
        clientsidePagination={true}
        pageSize={250}
        enableGlobalSearch={true}
        columnFilters={columnFilter}
      />
      {registrationOpen !== null && (
        <Drawer isOpen={drawerIsOpen} onCancel={() => setRegistrationOpen(null)}>
          <Drawer.Header as="h3" className="text-black">
            <p>Mailer</p>
          </Drawer.Header>
          <Drawer.Body>
            <EventNotificator
              eventTitle={event.title!}
              eventId={event.id!}
              onClose={() => setRegistrationOpen(null)}
              notificatorType={EventNotificatorType.EMAIL}
            />
          </Drawer.Body>
          <Drawer.Footer>
            <></>
          </Drawer.Footer>
        </Drawer>
      )}

      {currentRegistration && eventProducts && editorOpen && (
        <EditRegistrationProductsDialog
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

'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { ColumnFilter, DataTable } from '@eventuras/datatable';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import EventNotificator, { EventNotificatorType } from '@/components/event/EventNotificator';
import EditRegistrationProductsDialog from '@/components/eventuras/EditRegistrationProductsDialog';
import { EventDto, ProductDto, RegistrationDto } from "@/lib/eventuras-sdk";

import { getRegistrationDetails } from './participantActions';
import { createParticipantColumns } from './ParticipantTableColumns';


interface AdminEventListProps {
  participants: RegistrationDto[];
  event: EventDto;
  eventProducts?: ProductDto[];
  filteredStatus?: string;
  onUpdated?: () => void;
}

const EventParticipantList: React.FC<AdminEventListProps> = ({
  participants: initialParticipants = [],
  event,
  eventProducts = [],
  filteredStatus,
}) => {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  // Participant list state
  const [participants, setParticipants] = useState<RegistrationDto[]>(initialParticipants);

  // Email drawer state
  const [registrationOpen, setRegistrationOpen] = useState<RegistrationDto | null>(null);

  // Product editor state
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDto | null>(null);
  const [fullRegistration, setFullRegistration] = useState<RegistrationDto | null>(null);
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);

  // Update participant in list after status change
  const handleStatusUpdate = (updatedRegistration: RegistrationDto) => {
    setParticipants(prevParticipants =>
      prevParticipants.map(participant =>
        participant.registrationId === updatedRegistration.registrationId
          ? updatedRegistration
          : participant
      )
    );
  };

  // Load full registration details when opening product editor
  const handleProductsClick = async (registration: RegistrationDto) => {
    setSelectedRegistration(registration);
    setIsProductEditorOpen(true);

    startTransition(async () => {
      const details = await getRegistrationDetails(registration.registrationId!);
      if (details) {
        setFullRegistration(details);
      }
    });
  };

  // Check if a specific registration is currently loading
  const isLoadingRegistration = React.useCallback(
    (registration: RegistrationDto) => {
      return (
        isPending &&
        selectedRegistration?.registrationId === registration.registrationId &&
        !fullRegistration
      );
    },
    [isPending, selectedRegistration, fullRegistration]
  );

  // Table columns configuration
  const columns = useMemo(
    () =>
      createParticipantColumns({
        t: (key: string) => t(key).toString(),
        eventProducts,
        onProductsClick: handleProductsClick,
        onStatusUpdate: handleStatusUpdate,
        isLoadingRegistration,
      }),
    [t, eventProducts, isLoadingRegistration]
  );

  // Column filters based on status
  const columnFilter: ColumnFilter[] = useMemo(() => {
    if (!filteredStatus) return [];
    return [{ id: 'status', value: filteredStatus }];
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

      {/* Email notification drawer */}
      {registrationOpen && (
        <Drawer isOpen={true} onCancel={() => setRegistrationOpen(null)}>
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

      {/* Product editor dialog */}
      {fullRegistration && eventProducts && isProductEditorOpen && (
        <EditRegistrationProductsDialog
          eventProducts={eventProducts}
          currentRegistration={fullRegistration}
          startOpened={true}
          withButton={false}
          title={fullRegistration.user?.name ?? undefined}
          description={`Edit products for user ${fullRegistration.user?.email}`}
          onClose={(registrationUpdated: boolean) => {
            if (registrationUpdated) {
              // Reset state to force reload
              setSelectedRegistration(null);
              setFullRegistration(null);
            }
            setIsProductEditorOpen(false);
          }}
        />
      )}
    </>
  );
};

export default EventParticipantList;


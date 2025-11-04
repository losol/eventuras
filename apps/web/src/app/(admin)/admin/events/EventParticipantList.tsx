'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable } from '@eventuras/datatable';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import EditRegistrationProductsDialog from '@/components/eventuras/EditRegistrationProductsDialog';
import { EventNotificator, NotificationType } from '@/components/notificator';
import type {
  EventDto,
  EventStatisticsDto,
  ProductDto,
  RegistrationDto,
} from '@/lib/eventuras-sdk';
import { participationMap } from '@/utils/api/mappers';

import { ExcelExportButton } from './[id]/ExcelExportButton';
import AddUserToEvent from './AddUserToEvent';
import EventStatistics from './EventStatistics';
import { getRegistrationDetails } from './participantActions';
import { createParticipantColumns, renderExpandedRow } from './ParticipantTableColumns';

interface AdminEventListProps {
  participants: RegistrationDto[];
  event: EventDto;
  eventProducts?: ProductDto[];
  statistics: EventStatisticsDto;
  filteredStatus?: string;
  onStatusFilterChange?: (status: string) => void;
  showAddUser?: boolean;
}

const EventParticipantList: React.FC<AdminEventListProps> = ({
  participants: initialParticipants = [],
  event,
  eventProducts = [],
  statistics,
  filteredStatus,
  onStatusFilterChange,
  showAddUser = false,
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
          ? {
              ...updatedRegistration,
              // Preserve user info from the original registration since API might not return it
              user: updatedRegistration.user || participant.user,
              userId: updatedRegistration.userId || participant.userId,
            }
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

  // Filter participants by status
  const filteredParticipants = useMemo(() => {
    if (!filteredStatus) return participants;

    // Get the registration statuses for the selected participation type
    const statusesToInclude = participationMap[filteredStatus as keyof typeof participationMap];
    if (!statusesToInclude) return participants;

    return participants.filter(p => p.status && statusesToInclude.includes(p.status));
  }, [participants, filteredStatus]);

  return (
    <div>
      {/* DataTable with custom toolbar combining filters and search */}
      <DataTable
        data={filteredParticipants}
        columns={columns}
        clientsidePagination={true}
        pageSize={250}
        enableGlobalSearch={true}
        getRowId={(row: RegistrationDto) => row.registrationId?.toString() ?? ''}
        getRowCanExpand={() => true}
        renderSubComponent={({ row }: { row: { original: RegistrationDto } }) =>
          renderExpandedRow({
            registration: row.original,
            onStatusUpdate: handleStatusUpdate,
            t: (key: string) => t(key).toString(),
          })
        }
        renderToolbar={(searchInput: React.ReactNode) => (
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            {/* Status filter buttons using EventStatistics component */}
            <EventStatistics
              statistics={statistics}
              highlightedSelection={filteredStatus}
              onSelectionChanged={onStatusFilterChange}
            />

            <div className="flex items-center gap-3">
              {/* Search input */}
              {searchInput}

              {/* Excel export button */}
              {event.id && <ExcelExportButton EventinfoId={event.id} />}

              {/* Add User button */}
              {showAddUser && (
                <AddUserToEvent eventinfo={event} eventProducts={eventProducts} variant="outline" />
              )}
            </div>
          </div>
        )}
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
              notificationType={NotificationType.EMAIL}
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
    </div>
  );
};

export default EventParticipantList;

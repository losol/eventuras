'use client';

import {
  EventDto,
  NotificationsQueueingService,
  RegistrationDto,
  RegistrationsService,
  RegistrationStatus,
  RegistrationType,
} from '@losol/eventuras';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable, Heading } from 'components/content';
import { Loading, Unauthorized } from 'components/feedback';
import { Button } from 'components/inputs';
import { EmailDrawer, RegistrationDrawer } from 'components/overlays';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

type EventAdminPageProps = {
  pathId: number;
  eventInfo: EventDto;
  registrations: RegistrationDto[] | null;
};

const participantGroups = ['Participant', 'Lecturer', 'Staff'];

const columnHelper = createColumnHelper<RegistrationDto>();

// consider useMemo here or something smarter
const columns = [
  columnHelper.accessor('user.name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),

  columnHelper.accessor('user.email', {
    header: 'E-mail',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('user.phoneNumber', {
    header: 'Phone',
    cell: info => info.getValue(),
  }),
];

const EventAdminPage = ({ pathId, eventInfo, registrations }: EventAdminPageProps) => {
  const { data: session, status } = useSession();

  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState<RegistrationDto | null>(null);
  const [selectedParticipantGroups, updateSelectedParticipantGroups] = useState(['Participant']);
  const [emailBody, setEmailBody] = useState<string>('');
  const [subject, setSubject] = useState<string>('');

  const [opened, { open, close }] = useDisclosure();

  columns.push(
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <Button onClick={() => openRegistrationDetails(props.row.original.registrationId!)}>
          More
        </Button>
      ),
    })
  );

  const registrationDrawerToggle = () => {
    setRegistrationDrawerOpen(!registrationDrawerOpen);
  };

  const openRegistrationDetails = async (registrationId: number) => {
    //const s = await getSession();
    const registration = await RegistrationsService.getV3Registrations1({
      id: registrationId,
      includeProducts: true,
      includeUserInfo: true,
      includeOrders: true,
    });
    if (registration) {
      setActiveRegistration(registration);
    }

    registrationDrawerToggle();
  };

  const handleEmailDrawerSubmit = async () => {
    NotificationsQueueingService.postV3NotificationsEmail({
      requestBody: {
        eventParticipants: {
          eventId: pathId,
          registrationTypes: selectedParticipantGroups as RegistrationType[],
          registrationStatuses: [RegistrationStatus.VERIFIED, RegistrationStatus.DRAFT],
        },
        subject: subject,
        bodyMarkdown: emailBody,
      },
    })
      .then(() => {
        close();
        notifications.show({
          title: 'Sent some emails ',
          message: 'Successfully submitted!',
          color: 'green',
        });
      })
      .catch(() => {
        notifications.show({
          title: 'Something went wrong! ',
          message: 'Sorry!',
          color: 'red',
        });
      });
  };

  const handleParticipantGroupsChange = (group: string) => {
    const updatedSelectedGroups = [...selectedParticipantGroups];
    if (updatedSelectedGroups.includes(group)) {
      const index = selectedParticipantGroups.findIndex(element => element === group);
      updatedSelectedGroups.splice(index, 1);
    } else {
      updatedSelectedGroups.push(group);
    }
    updateSelectedParticipantGroups(updatedSelectedGroups);
  };

  if (status === 'loading' || !eventInfo) return <Loading />;
  if (status === 'unauthenticated' || !session) return <Unauthorized />;

  return (
    <>
      <Heading as="h1">{eventInfo.title}</Heading>
      <Button onClick={open}>E-mail all</Button>

      {registrations ? <DataTable data={registrations} columns={columns} /> : null}

      <EmailDrawer
        isOpen={opened}
        onClose={close}
        recipientGroups={participantGroups}
        selectedRecipientGroups={selectedParticipantGroups}
        handleParticipantGroupsChange={group => handleParticipantGroupsChange(group)}
        setEmailBody={setEmailBody}
        setSubject={setSubject}
        onSubmit={() => handleEmailDrawerSubmit()}
      />

      {activeRegistration && (
        <RegistrationDrawer
          registration={activeRegistration}
          isOpen={registrationDrawerOpen}
          onClose={registrationDrawerToggle}
        />
      )}
    </>
  );
};

export default EventAdminPage;

import {
  Button,
  Container,
  Heading,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  DataTable,
  EmailDrawer,
  Layout,
  Loading,
  RegistrationDrawer,
  Unauthorized,
} from 'components';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import {
  EventDto,
  EventsService,
  RegistrationsService,
  RegistrationDto,
  NotificationsQueueingService,
  RegistrationType,
  RegistrationStatus,
} from '@losol/eventuras';

const EventAdmin = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [activeRegistration, setActiveRegistration] =
    useState<RegistrationDto | null>(null);
  const { data: session, status } = useSession();
  const toast = useToast();
  const [eventInfo, setEventInfo] = useState<EventDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationDto[] | null>(
    []
  );
  const participantGroups = ['Participant', 'Lecturer', 'Staff'];
  const [selectedParticipantGroups, updateSelectedParticipantGroups] = useState(
    ['Participant']
  );
  const [emailBody, setEmailBody] = useState<string>('');
  const [subject, setSubject] = useState<string>('');

  const registrationsColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'user.name',
      },
      {
        Header: 'E-mail',
        accessor: 'user.email',
      },
      {
        Header: 'Phone',
        accessor: 'user.phoneNumber',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: function RenderCell({ row }: { row: any }) {
          return (
            <Button
              key={row.original.id}
              onClick={() =>
                openRegistrationDetails(row.original.registrationId)
              }
            >
              Detaljer
            </Button>
          );
        },
      },
    ],
    []
  );

  const loadEventInfo = async () => {
    router.query.id &&
      session &&
      setEventInfo(
        await EventsService.getV3Events1(parseInt(router.query.id.toString()))
      );
  };

  const loadRegistrations = async () => {
    if (session) {
      const result = await RegistrationsService.getV3Registrations(
        parseInt(router.query.id!.toString())
      );
      setRegistrations(result.data!);
    }
  };

  const registrationDrawerToggle = () => {
    setRegistrationDrawerOpen(!registrationDrawerOpen);
  };

  const openRegistrationDetails = async (registrationId: number) => {
    const s = await getSession();
    const registration = await RegistrationsService.getV3Registrations1(
      registrationId
    );
    if (registration) {
      setActiveRegistration(registration);
    }

    registrationDrawerToggle();
  };

  useEffect(() => {
    loadEventInfo();
    loadRegistrations();
  }, [router.query.id, session]);

  const handleEmailDrawerSubmit = async () => {
    NotificationsQueueingService.postV3NotificationsEmail({
      eventParticipants: {
        eventId: parseInt(router.query.id! as string, 10),
        registrationTypes: selectedParticipantGroups as RegistrationType[],
        registrationStatuses: [
          RegistrationStatus.VERIFIED,
          RegistrationStatus.DRAFT,
        ],
      },
      subject: subject,
      bodyMarkdown: emailBody,
    })
      .then(() => {
        onClose();
        toast({
          title: 'Successfully submitted!',
          position: 'top',
          isClosable: true,
          status: 'success',
        });
      })
      .catch(() => {
        toast({
          title: 'Something went wrong!',
          position: 'top',
          status: 'error',
          isClosable: true,
        });
      });
  };

  const handleParticipantGroupsChange = (group: string) => {
    const updatedSelectedGroups = [...selectedParticipantGroups];
    if (updatedSelectedGroups.includes(group)) {
      const index = selectedParticipantGroups.findIndex(
        element => element === group
      );
      updatedSelectedGroups.splice(index, 1);
    } else {
      updatedSelectedGroups.push(group);
    }
    updateSelectedParticipantGroups(updatedSelectedGroups);
  };

  if (status === 'loading' || !eventInfo) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (status === 'unauthenticated')
    return (
      <Layout>
        <Unauthorized />
      </Layout>
    );

  return (
    <Layout>
      <Container marginTop="32">
        <Heading as="h1" paddingY="4">
          {eventInfo!.title}
        </Heading>
        <Button colorScheme="teal" onClick={onOpen}>
          E-mail all
        </Button>

        <DataTable data={registrations} columns={registrationsColumns} />
      </Container>
      <EmailDrawer
        isOpen={isOpen}
        onClose={onClose}
        recipientGroups={participantGroups}
        selectedRecipientGroups={selectedParticipantGroups}
        handleParticipantGroupsChange={group =>
          handleParticipantGroupsChange(group)
        }
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
    </Layout>
  );
};

export default EventAdmin;

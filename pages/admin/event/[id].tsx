/* eslint-disable */

import {
  EventDto,
  EventsService,
  NotificationsQueueingService,
  RegistrationDto,
  RegistrationsService,
  RegistrationStatus,
  RegistrationType,
} from '@losol/eventuras';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Button } from 'components/inputs';
import { notifications } from '@mantine/notifications';
import { Container, Layout } from 'components/layout';
import { Loading, Unauthorized } from 'components/feedback';
import { Heading } from 'components/typography';
import { DataTable } from 'components/datadisplay';
import { EmailDrawer, RegistrationDrawer } from 'components/overlays';

const EventAdmin = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure();
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState<RegistrationDto | null>(null);
  const { data: session, status } = useSession();
  const [eventInfo, setEventInfo] = useState<EventDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationDto[] | null>([]);
  const participantGroups = ['Participant', 'Lecturer', 'Staff'];
  const [selectedParticipantGroups, updateSelectedParticipantGroups] = useState(['Participant']);
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
              onClick={() => openRegistrationDetails(row.original.registrationId)}
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
        await EventsService.getV3Events1({
          id: parseInt(router.query.id!.toString()),
        })
      );
  };

  const loadRegistrations = async () => {
    if (session) {
      const result = await RegistrationsService.getV3Registrations({
        eventId: parseInt(router.query.id!.toString()),
        includeProducts: true,
        includeUserInfo: true,
      });
      setRegistrations(result.data!);
    }
  };

  const registrationDrawerToggle = () => {
    setRegistrationDrawerOpen(!registrationDrawerOpen);
  };

  const openRegistrationDetails = async (registrationId: number) => {
    const s = await getSession();
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

  useEffect(() => {
    loadEventInfo();
    loadRegistrations();
  }, [router.query.id, session]);

  const handleEmailDrawerSubmit = async () => {
    NotificationsQueueingService.postV3NotificationsEmail({
      requestBody: {
        eventParticipants: {
          eventId: parseInt(router.query.id! as string, 10),
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
      <Container>
        <Heading as="h1">{eventInfo!.title}</Heading>
        <Button onClick={open}>E-mail all</Button>

        <DataTable data={registrations ?? []} columns={registrationsColumns} />
      </Container>
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
    </Layout>
  );
};

export default EventAdmin;

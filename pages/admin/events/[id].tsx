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
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';

const EventAdmin = () => {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure();
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState<RegistrationDto | null>(null);
  const { data: session, status } = useSession();
  const [eventInfo, setEventInfo] = useState<EventDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const participantGroups = ['Participant', 'Lecturer', 'Staff'];
  const [selectedParticipantGroups, updateSelectedParticipantGroups] = useState(['Participant']);
  const [emailBody, setEmailBody] = useState<string>('');
  const [subject, setSubject] = useState<string>('');

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
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <Button onClick={() => openRegistrationDetails(props.row.original.registrationId!)}>
          More
        </Button>
      ),
    }),
  ];

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

        <DataTable data={registrations} columns={columns} />
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

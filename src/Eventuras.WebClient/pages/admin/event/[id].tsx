import {
  Button,
  Container,
  Heading,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { DataTable, Layout } from '@components/common';
import { EmailDrawer } from '@components/communication';
import { getEventInfo } from '@lib/EventInfo';
import { getRegistrationsForEvent } from '@lib/Registration';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import { useEffect, useMemo, useState } from 'react';

const EventAdmin = (): JSX.Element => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [session] = useSession();
  const toast = useToast();
  const [eventInfo, setEventInfo] = useState({ title: '' });
  const [registrations, setRegistrations] = useState([]);
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
        Cell: function RenderCell({ row }) {
          return (
            <Button
              key={row.original.id}
              onClick={() => window.alert(row.original.registrationId)}
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
        await getEventInfo(
          parseInt(router.query.id.toString()),
          session.accessToken
        )
      );
  };

  const loadRegistration = async () => {
    if (session) {
      const result = await getRegistrationsForEvent(
        parseInt(router.query.id.toString()),
        session.accessToken
      );
      console.log(result.data);
      setRegistrations(result.data);
    }
  };

  useEffect(() => {
    loadEventInfo();
    loadRegistration();
  }, [router.query.id, session]);

  const handleEmailDrawerSubmit = async () => {
    fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/notifications/email', {
      method: 'POST',
      body: JSON.stringify({
        eventParticipants: {
          eventId: router.query.id,
          registrationTypes: selectedParticipantGroups,
          registrationStatuses: ['Verified', 'Draft'],
        },
        subject: subject,
        bodyMarkdown: emailBody,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(
          JSON.stringify(session.accessToken)
        )}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
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
        (element) => element === group
      );
      updatedSelectedGroups.splice(index, 1);
    } else {
      updatedSelectedGroups.push(group);
    }
    updateSelectedParticipantGroups(updatedSelectedGroups);
  };

  return (
    <Layout>
      <Container marginTop="32">
        <Heading as="h1" paddingY="4">
          {eventInfo.title}
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
        handleParticipantGroupsChange={(group) =>
          handleParticipantGroupsChange(group)
        }
        setEmailBody={setEmailBody}
        setSubject={setSubject}
        onSubmit={() => handleEmailDrawerSubmit()}
      />
    </Layout>
  );
};

export default EventAdmin;

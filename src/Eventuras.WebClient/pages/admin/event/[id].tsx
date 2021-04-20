import {
  Button,
  Container,
  Heading,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

import { EmailDrawer } from '@components/communication';
import { Layout } from '@components/common';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import { useState } from 'react';

const EventAdmin = (): JSX.Element => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [session] = useSession();
  const toast = useToast();
  const participantGroups = ['Participant', 'Lecturer', 'Staff'];
  const [
    selectedParticipantGroups,
    updateSelectedParticipantGroups,
  ] = useState(['Participant']);
  const [emailBody, setEmailBody] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
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
          Event admin page
        </Heading>
        <Button colorScheme="teal" onClick={onOpen}>
          Send e-mail
        </Button>
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

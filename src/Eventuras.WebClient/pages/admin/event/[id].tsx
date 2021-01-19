import { Button, Container, Heading, useDisclosure } from '@chakra-ui/react';

import { EmailDrawer } from '@components/communication';
import { Layout } from '@components/common';
import React from 'react';

const EventAdmin = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const participantGroups = [
    'Participants',
    'Lecturers',
    'Staff'
  ]

  return (
    <Layout>
      <Container marginTop="32">
        <Heading as="h1" paddingY="4">Event admin page</Heading>
        <Button colorScheme="teal" onClick={onOpen}>
          Send e-mail
        </Button>
      </Container>

      <EmailDrawer isOpen={isOpen} onClose={onClose} participantGroups={participantGroups} />
    </Layout>
  );
};

export default EventAdmin;

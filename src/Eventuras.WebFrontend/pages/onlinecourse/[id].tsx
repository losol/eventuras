import { Button, Container, Heading, useDisclosure } from '@chakra-ui/react';
import { AlertModal, Layout } from 'components';
import { UserContext } from 'context';
import { signIn, useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import { registerForEvent } from 'services';

import { EventType } from '../../types';

type EventInfoProps = {
  name: string;
  description: string;
};

const EventInfo = (props: EventInfoProps) => {
  const { data: session, status } = useSession();
  const { name = '...', description = '...' } = props;
  const { user } = useContext(UserContext);
  const [modal, setModal] = useState({ title: '', text: '' });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRegistrationEventRequest = async () => {
    await registerForEvent(
      {
        userId: user.id,
        eventId: props.id,
      },
      session.user.accessToken
    );
    setModal({
      title: 'Welcome!',
      text: `Welcome to ${props.name}`,
    });
    onOpen();
  };

  const handleLoginAndRegistrationEvent = async () => {
    try {
      await signIn('auth0');
      localStorage.setItem('EVENT_REGISTRATION_AFTER_LOGIN', 'true');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (
      user &&
      user.id &&
      localStorage.getItem('EVENT_REGISTRATION_AFTER_LOGIN')
    ) {
      handleRegistrationEventRequest();
      localStorage.removeItem('EVENT_REGISTRATION_AFTER_LOGIN');
    }
  }, [user]);
  return (
    <Layout>
      <Container marginTop="32">
        <Heading>{name}</Heading>
        {description}
        <br />
        {!session && (
          <Button
            colorScheme="teal"
            mt={5}
            variant="outline"
            isLoading={status === 'loading'}
            onClick={handleLoginAndRegistrationEvent}
          >
            Login and register for event
          </Button>
        )}
        {session && (
          <Button
            colorScheme="teal"
            variant="outline"
            mt={5}
            isLoading={status === 'loading'}
            onClick={handleRegistrationEventRequest}
          >
            Register for online course
          </Button>
        )}
        <AlertModal
          isOpen={isOpen}
          onClose={onClose}
          title={modal.title}
          text={modal.text}
        />
      </Container>
    </Layout>
  );
};

type StaticProps = {
  id: string;
  name: string;
};

export const getStaticProps = async ({ params }) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/events/' + params.id
  );
  const json = await res.json();
  return { props: { ...json } };
};

export async function getStaticPaths() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/onlinecourses/'
  );
  const events = await res.json();

  const paths = events.map((event: EventType) => ({
    params: {
      id: event.id.toString(),
    },
  }));

  return { paths, fallback: false };
}
export default EventInfo;

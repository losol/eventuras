import { Button, Container, Heading, useDisclosure } from '@chakra-ui/react';
import { AlertModal, Layout } from 'components';
import { UserContext } from 'context';
import { signIn, useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import { EventsService, OnlineCourseService } from '@losol/eventuras';

const EventInfo = props => {
  const { data: session, status } = useSession();
  const { title = '...', description = '...' } = props;
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
      text: `Welcome to ${props.title}`,
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
        <Heading>{title}</Heading>
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
            Register for event
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

export const getStaticProps = async ({ params }) => {
  const event = await EventsService.getV3Events1({ id: params.id }).catch(e => {
    console.log('getStaticProps error ', e);
    return { props: null };
  });
  return { props: { ...event } };
};

export async function getStaticPaths() {
  const defaultPath = { paths: [], fallback: false };
  const { data: onlineEvents } = await EventsService.getV3Events({}).catch(
    e => {
      return { data: null };
    }
  );
  if (!onlineEvents?.length) {
    return defaultPath;
  }
  const paths = onlineEvents.map(event => ({
    params: {
      id: event.id.toString(),
    },
  }));

  return { paths, fallback: false };
}

export default EventInfo;

import { Button, Container, Heading, useDisclosure } from '@chakra-ui/react';
import { EventsService } from '@losol/eventuras';
import { AlertModal, Layout } from 'components';
import { UserContext } from 'context';
import parse from 'html-react-parser';
import { signIn, useSession } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';
import { useContext, useEffect, useState } from 'react';

const EventInfo = props => {
  const { data: session, status } = useSession();
  const { title = '...', description = '...' } = props;
  const { t } = useTranslation();
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
    if (user && user.id && localStorage.getItem('EVENT_REGISTRATION_AFTER_LOGIN')) {
      handleRegistrationEventRequest();
      localStorage.removeItem('EVENT_REGISTRATION_AFTER_LOGIN');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {props.moreInformation && (
          <>
            <Heading as="h2" size="md" paddingTop={16}>
              {t('More information')}
            </Heading>
            {parse(props.moreInformation)}
          </>
        )}
        {props.program && (
          <>
            <Heading as="h2" size="md" paddingTop={16}>
              {t('Program')}
            </Heading>
            {parse(props.program)}
          </>
        )}
        {props.practicalInformation && (
          <>
            <Heading as="h2" size="md" paddingTop={16}>
              {t('Practical Information')}
            </Heading>
            {parse(props.practicalInformation)}
          </>
        )}
        <AlertModal isOpen={isOpen} onClose={onClose} title={modal.title} text={modal.text} />
      </Container>
    </Layout>
  );
};

export const getStaticProps = async ({ params }) => {
  const event = await EventsService.getV3Events1({ id: params.id }).catch(e => {
    console.log('getStaticProps error ', e);
    console.log(event);
    return { props: null };
  });
  return { props: { ...event } };
};

export async function getStaticPaths() {
  const defaultPath = { paths: [], fallback: false };
  const { data: onlineEvents } = await EventsService.getV3Events({}).catch(() => {
    return { data: null };
  });
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

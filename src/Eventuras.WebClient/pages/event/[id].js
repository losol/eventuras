import { Button, Container, Heading, useDisclosure } from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/client';
import { useContext, useEffect, useState } from 'react';

import { Layout } from '../../components/common';
import AlertModal from '../../components/common/Modals';
import { UserContext } from '../../context/UserContext';
import { usePrevious } from '../../hooks/usePrevious';

const EventInfo = (props) => {
  const [session, loading] = useSession();
  const { name = '...', description = '...' } = props;
  const { user } = useContext(UserContext);
  const [modal, setModal] = useState({ title: '', text: '' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const prevUser = usePrevious(user);
  const handleRegistrationEventRequest = async () => {
    fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/registrations/', {
      method: 'POST',
      body: JSON.stringify({
        UserId: user.id,
        EventId: props.id,
      }),
      headers: {
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
        setModal({
          title: 'Success!',
          text: `Welcome to ${props.name}`,
        });

        onOpen();
      })
      .catch(() => {
        setModal({
          title: 'Oops!',
          text: 'Sorry, we failed',
        });
        onOpen();
      });
  };

  const handleLoginAndRegistrationEvent = async () => {
    try {
      await signIn('auth');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!prevUser && user && user.id) {
      handleRegistrationEventRequest();
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
            isLoading={loading}
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
            isLoading={loading}
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
export async function getStaticProps({ params }) {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/events/' + params.id
  );
  const json = await res.json();
  return { props: { ...json } };
}

export async function getStaticPaths() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/events/');
  const events = await res.json();

  const paths = events.map((e) => ({
    params: {
      id: e.id.toString(),
    },
  }));

  return { paths, fallback: false };
}
export default EventInfo;

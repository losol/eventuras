import { Container, Heading } from '@chakra-ui/react';
import React, { useEffect } from 'react';

import { Layout } from '../../components/common';
import { useSession } from 'next-auth/client';

function AdminIndex() {
  let registrations;
  const [session, loading, error] = useSession();

  useEffect(async () => {
    if (loading) {
      registrations = await fetch('/api/getEventurasData');
    }
  }, [loading]);

  // const { data: registrations } = useApi('/v3/registrations');
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (!loading && !session)
    return (
      <Layout>
        <p> Access Denied</p>
      </Layout>
    );

  if (session) {
    return (
      <Layout>
        <Container paddingTop="32">
          <Heading as="h1">Admin</Heading>
          <Heading as="h2" paddingTop="16">
            Siste registreringer
          </Heading>
          {registrations &&
            registrations.map((r) => (
              <p>
                {r.registrationId}, {r.userId}
              </p>
            ))}
        </Container>
      </Layout>
    );
  }
}

export default AdminIndex;

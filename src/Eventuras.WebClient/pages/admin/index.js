import { Container, Heading } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/client';

import { Layout } from '../../components/common';
import axios from 'axios';

function AdminIndex() {
  const [session, loading, error] = useSession();

  useEffect(async () => {
    if (loading) {
      const { data } = await axios.get('/api/getEventurasData', {
        withCredentials: true,
      });
      //setSubsList(
      //data.map((sub) => ({
      //id: sub.id,
      // title: sub.snippet.title,
      //}))
      //);
      setLoading(false);
    }
  }, [loading]);

  let registrations;

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

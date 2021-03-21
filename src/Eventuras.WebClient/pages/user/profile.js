import { Container, Heading, Text } from '@chakra-ui/react';

import { Layout } from '../../components/common';
import React from 'react';
import { useSession } from 'next-auth/client';

function UserProfile() {
  const [session, loading] = useSession();

  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Min bruker</Heading>
        {session && (
          <>
            <Text>Navn: {session && session.user.name}</Text>
            <Text>E-post: {session && session.user.email}</Text>
          </>
        )}
      </Container>
    </Layout>
  );
}

export default UserProfile;

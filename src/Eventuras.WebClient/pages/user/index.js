import { Container, Heading } from '@chakra-ui/react';

import { Layout } from '../../components/common';
import React from 'react';
import { useSession } from 'next-auth/client';

function UserIndex() {
  const [session, loading] = useSession();
  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Heihei {session && session.user.name} </Heading>
      </Container>
    </Layout>
  );
}

export default UserIndex;

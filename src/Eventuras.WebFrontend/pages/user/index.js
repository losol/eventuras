import { Container, Heading } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

import { Layout } from '../../components/common';

function UserIndex() {
  const { data: session, status } = useSession();
  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Heihei {session && session.user?.name} </Heading>
      </Container>
    </Layout>
  );
}

export default UserIndex;

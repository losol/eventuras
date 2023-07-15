import { Container, Heading } from '@chakra-ui/react';
import { useSession } from 'next-auth/client';

import { Layout } from '../../components/common';

function UserIndex() {
  const [session, loading] = useSession();
  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Heihei {session && session.user?.name} </Heading>
      </Container>
    </Layout>
  );
}

export default UserIndex;

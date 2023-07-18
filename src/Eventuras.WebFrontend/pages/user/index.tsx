import { Container, Heading } from '@chakra-ui/react';
import { Layout } from 'components';
import { useSession } from 'next-auth/react';

function UserIndex() {
  const { data: session } = useSession();
  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Heihei {session && session.user?.name} </Heading>
      </Container>
    </Layout>
  );
}

export default UserIndex;

import { Container, Layout } from 'components/layout';
import { Heading } from 'components/typography';
import { useSession } from 'next-auth/react';

function UserIndex() {
  const { data: session } = useSession();
  return (
    <Layout>
      <Container>
        <Heading>Heihei {session && session.user?.name} </Heading>
      </Container>
    </Layout>
  );
}

export default UserIndex;

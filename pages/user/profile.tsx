import { Loading } from 'components/feedback';
import { Container, Layout } from 'components/layout';
import { Heading, Text } from 'components/typography';
import { UserContext } from 'context';
import { useSession } from 'next-auth/react';
import React, { useContext } from 'react';

const UserProfile = () => {
  const { data: session, status } = useSession();
  const { user } = useContext(UserContext);
  const name = user?.name;
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;

  return (
    <Layout>
      <Container>
        <Heading>Min bruker</Heading>
        {status === 'loading' && <Loading />}
        {session && (
          <>
            <Text>Navn: {name}</Text>
            <Text>E-post: {email}</Text>
            <Text>Phone: {phoneNumber}</Text>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default UserProfile;

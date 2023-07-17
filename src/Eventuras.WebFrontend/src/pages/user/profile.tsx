import { Container, Heading, Text } from '@chakra-ui/react';
import { Layout, Loading } from 'components';
import { UserContext } from 'context';
import { useSession } from 'next-auth/react';
import React, { useContext } from 'react';

const UserProfile = () => {
  const { data: session, status } = useSession();
  const {
    user: { name, email, phoneNumber },
  } = useContext(UserContext);

  return (
    <Layout>
      <Container marginTop="16">
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

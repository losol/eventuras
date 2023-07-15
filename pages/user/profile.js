import { Container, Heading, Text } from '@chakra-ui/react';
import { UserContext } from '@context/UserContext';
import { useSession } from 'next-auth/client';
import React, { useContext } from 'react';

import { Layout, Loading } from '../../components/common';

const UserProfile = () => {
  const [session, loading] = useSession();
  const { user } = useContext(UserContext);

  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Min bruker</Heading>
        {loading && <Loading />}
        {session && (
          <>
            <Text>Navn: {user && user.name}</Text>
            <Text>E-post: {user && user.email}</Text>
            <Text>Phone: {user && user.phoneNumber}</Text>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default UserProfile;

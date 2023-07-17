import { Container, Heading, Text } from '@chakra-ui/react';
import { UserContext } from '@context/UserContext';
import { useSession } from 'next-auth/react';
import React, { useContext } from 'react';

import { Layout, Loading } from '../../components/common';

const UserProfile = () => {
  const { data: session, status } = useSession();
  const { user } = useContext(UserContext);

  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Min bruker</Heading>
        {status === 'loading' && <Loading />}
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

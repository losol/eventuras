import { Container, Heading } from '@chakra-ui/react';
import { Layout, Link } from '@components/common';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

import React from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/client';

function AdminUsersIndex() {
  const { data: users } = useSWR('/api/getUsers');
  const [session, loading, error] = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (!loading && !session)
    return (
      <Layout>
        <p> Access Denied</p>
      </Layout>
    );

  if (session) {
    return (
      <Layout>
        <Container paddingTop="32">
          <Heading as="h1" paddingBottom="16">
            <Link href="/admin/">Admin</Link> &gt; Brukere
          </Heading>

          <Table size="md" paddingTop="32">
            <Thead>
              <Tr>
                <Th>Navn</Th>
                <Th>E-post</Th>
                <Th>Telefon</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users &&
                users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.phoneNumber}</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>
      </Layout>
    );
  }
}

export default AdminUsersIndex;

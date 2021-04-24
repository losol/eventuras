import { PhoneIcon } from '@chakra-ui/icons';
import {
  Button,
  Container,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';

import { Layout, Link } from '../../components/common';

function AdminIndex() {
  const { data: events } = useSWR('/api/getEvents');
  const { data: registrations } = useSWR('/api/getRegistrations');
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
          <Heading as="h1">Admin</Heading>

          <Link href="/admin/users">
            {' '}
            <Button leftIcon={<PhoneIcon />} colorScheme="teal" variant="solid">
              Users
            </Button>
          </Link>

          <Table size="md" paddingTop="32">
            <Thead>
              <Tr>
                <Th>EventId</Th>
                <Th>Title</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events &&
                events.map((event) => (
                  <Tr key={event.id}>
                    <Td>{event.id}</Td>
                    <Td>{event.name}</Td>
                    <Td>
                      <Link href={`/admin/event/${event.id}`}>Se mer</Link>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>

          <Heading as="h2" fontSize="2xl" paddingTop="16" paddingBottom="4">
            Siste registreringer
          </Heading>

          <Table size="md" paddingTop="32">
            <Thead>
              <Tr>
                <Th>UserId</Th>
                <Th>EventId</Th>
              </Tr>
            </Thead>
            <Tbody>
              {registrations?.data &&
                registrations.data.map((r) => (
                  <Tr key={r.registrationId}>
                    <Th>{r.userId}</Th>
                    <Th>{r.eventId}</Th>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>
      </Layout>
    );
  }
}

export default AdminIndex;

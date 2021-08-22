import { Button, Container, Heading, Text } from '@chakra-ui/react';
import {
  DataTable,
  Layout,
  Link,
  Loading,
  Unauthorized,
} from '@components/common';
import { getEvents } from '@lib/EventInfo';
import * as dayjs from 'dayjs';
import { useSession } from 'next-auth/client';
import { useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';

function AdminIndex() {
  const [session, loading] = useSession();
  const [eventinfos, setEventinfos] = useState([]);
  const columns = [
    {
      Header: 'Title',
      accessor: 'title',
    },
    {
      Header: 'Location',
      accessor: 'location',
    },
    {
      Header: 'When',
      accessor: 'when',
      Cell: function RenderCell({ row }) {
        return <Text>{dayjs(row.original.dateStart).format('D-MM-YYYY')}</Text>;
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: function RenderCell({ row }) {
        return (
          <Link key={row.original.id} href={`/admin/event/${row.original.id}`}>
            <Button colorScheme="teal">Mer</Button>
          </Link>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      const result = await getEvents(1);
      setEventinfos(result.data);
    };
    fetchEvents();
  }, [session]);

  if (loading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  if (!session)
    return (
      <Layout>
        <Unauthorized />
      </Layout>
    );

  if (session) {
    return (
      <Layout>
        <Container paddingTop="24">
          <Heading as="h1">Admin</Heading>

          <Link href="/admin/users">
            {' '}
            <Button leftIcon={<FiUsers />} variant="outline">
              Users
            </Button>
          </Link>

          <Heading as="h2" fontSize="2xl" paddingTop="16" paddingBottom="4">
            Arrangement
          </Heading>
          <DataTable columns={columns} data={eventinfos} />
        </Container>
      </Layout>
    );
  }
}

export default AdminIndex;

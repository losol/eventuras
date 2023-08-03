/* eslint-disable */

import { EventsService } from '@losol/eventuras';
import { Container } from '@mantine/core';
import { DataTable } from 'components/datadisplay';
import { Loading, Unauthorized } from 'components/feedback';
import { Layout } from 'components/layout';
import { Heading, Text } from 'components/typography';
import NextLink from 'next/link';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

function AdminIndex() {
  const { data: session, status } = useSession();

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
        console.log(row);
        return <Text>{row.original.dateStart}</Text>;
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: function RenderCell({ row }) {
        return (
          <Link key={row.original.id} href={`/admin/event/${row.original.id}`}>
            Mer
          </Link>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      const organizationFilter = {};
      if (process.env.NEXT_PUBLIC_ORGANIZATION_ID !== null) {
        organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID;
      }

      const result = await EventsService.getV3Events({ organizationFilter });
      setEventinfos(result.data);
    };
    fetchEvents();
  }, [session]);

  if (status === 'loading')
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
        <Container>
          <Heading as="h1">Admin</Heading>

          <NextLink href="/admin/users">
            <Link href="admin/users">Users</Link>
          </NextLink>

          <Heading as="h2">Arrangement</Heading>
          <DataTable columns={columns} data={eventinfos} />
        </Container>
      </Layout>
    );
  }
}

export default AdminIndex;

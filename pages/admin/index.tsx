/* eslint-disable */

import { EventsService, EventDto } from '@losol/eventuras';
import { Container } from '@mantine/core';
import { Loading, Unauthorized } from 'components/feedback';
import { Layout } from 'components/layout';
import { DataTable, Heading } from 'components/content';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

function AdminIndex() {
  const { data: session, status } = useSession();

  const [eventinfos, setEventinfos] = useState<EventDto[]>([]);

  const columnHelper = createColumnHelper<EventDto>();

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <Link href={`admin/events/${info.row.original.id}`}>{info.getValue()}</Link>,
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('dateStart', {
      header: 'When',
      cell: info => info.getValue(),
    }),
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      type OrganizationFilter = {
        organizationId?: number;
      };
      const organizationFilter: OrganizationFilter = {};
      if (process.env.NEXT_PUBLIC_ORGANIZATION_ID !== null) {
        organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID;
      }

      const result = await EventsService.getV3Events(organizationFilter);
      setEventinfos(result.data as EventDto[]);
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

          <Link href="/admin/users">
            <Link href="admin/users">Users</Link>
          </Link>

          <Heading as="h2">Arrangement</Heading>
          <DataTable columns={columns} data={eventinfos} />
        </Container>
      </Layout>
    );
  }
}

export default AdminIndex;

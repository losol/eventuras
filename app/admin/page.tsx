'use client';

import { EventDto } from '@losol/eventuras';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable, Heading } from 'components/content';
import { Loading, Unauthorized } from 'components/feedback';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import CreateEvent from './(components)/CreateEvent';

//const ORGANIZATION_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID || '1';

export default function AdminPage() {
  const { data: session, status } = useSession();

  const [eventinfos] = useState<EventDto[]>([]);

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

  //useEffect(() => {
  //  const fetchEvents = async () => {
  //    const organizationFilter: OrganizationFilter = {};
  //    if (ORGANIZATION_ID) organizationFilter.organizationId = Number(ORGANIZATION_ID);
  //    const result = await EventsService.getV3Events(organizationFilter);
  //    setEventinfos(result.data as EventDto[]);
  //  };
  //  fetchEvents();
  //}, [session]);

  if (status === 'loading') return <Loading />;
  if (!session) return <Unauthorized />;

  return (
    <>
      <Heading as="h1">Admin</Heading>

      <div className="inline-flex flex-col">
        <Link href="/admin/users">Users</Link>
        <CreateEvent />
      </div>

      <Heading as="h2">Arrangement</Heading>
      <DataTable columns={columns} data={eventinfos} />
    </>
  );
}

//type OrganizationFilter = {
//  organizationId?: number;
//};

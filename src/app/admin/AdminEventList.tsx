'use client';

import { EventDto } from '@losol/eventuras';
import Link from 'next/link';

import { createColumnHelper, DataTable } from '@/components/content';
const columnHelper = createColumnHelper<EventDto>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => <Link href={`/admin/events/${info.row.original.id}`}> {info.getValue()}</Link>,
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

interface AdminEventListProps {
  eventinfo: EventDto[];
}

const AdminEventList: React.FC<AdminEventListProps> = ({ eventinfo = [] }) => {
  return (
    <>
      <DataTable data={eventinfo} columns={columns} clientsidePagination />
    </>
  );
};

export default AdminEventList;

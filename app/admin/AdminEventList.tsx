'use client';

import { EventDto } from '@losol/eventuras';
import { createColumnHelper, DataTable } from 'components/content';
const columnHelper = createColumnHelper<EventDto>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => info.getValue(),
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
      <DataTable data={eventinfo} columns={columns} />
    </>
  );
};

export default AdminEventList;

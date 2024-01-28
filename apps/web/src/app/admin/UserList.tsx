'use client';
import { EventDto, UserDto } from '@losol/eventuras';

import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
const columnHelper = createColumnHelper<EventDto>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'PhoneNumber',
    cell: info => info.getValue(),
  }),
];

interface UserListProps {
  users: UserDto[];
}

const UserList: React.FC<UserListProps> = ({ users = [] }) => {
  return (
    <>
      <DataTable data={users} columns={columns} />
    </>
  );
};

export default UserList;

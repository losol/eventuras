'use client';
import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { UserDto } from '@eventuras/event-sdk';
import { useTranslations } from 'next-intl';

import { Link } from '@eventuras/ratio-ui-next/Link';
const columnHelper = createColumnHelper<UserDto>();
interface UserListProps {
  users: UserDto[];
}

const UserList: React.FC<UserListProps> = ({ users = [] }) => {
  const t = useTranslations();
  const renderUserActions = (u: UserDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/users/${u.id}`}>
          {t('common.labels.view')}
        </Link>
      </div>
    );
  };
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
    columnHelper.display({
      id: 'actions',
      header: t('admin.participantColumns.actions').toString(),
      cell: info => renderUserActions(info.row.original),
    }),
  ];
  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        clientsidePagination={true}
        pageSize={10}
        enableGlobalSearch={true}
      />
    </>
  );
};

export default UserList;

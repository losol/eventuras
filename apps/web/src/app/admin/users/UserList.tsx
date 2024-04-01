'use client';
import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { UserDto } from '@eventuras/sdk';
import Link from '@eventuras/ui/Link';
import createTranslation from 'next-translate/createTranslation';
const columnHelper = createColumnHelper<UserDto>();
interface UserListProps {
  users: UserDto[];
}

const UserList: React.FC<UserListProps> = ({ users = [] }) => {
  const { t } = createTranslation();
  const renderUserActions = (u: UserDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/users/${u.id}`}>
          {t('common:labels.view')}
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
      header: t('admin:participantColumns.actions').toString(),
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

'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { UserDto } from '@/lib/eventuras-sdk';

const columnHelper = createColumnHelper<UserDto>();

type UserListProps = {
  users: UserDto[];
  currentPage: number;
  totalPages: number;
};

const UserList: React.FC<UserListProps> = ({ users, currentPage, totalPages }) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (!Number.isFinite(newPage)) return;
    const safePage = Math.min(totalPages, Math.max(1, newPage));
    const params = new URLSearchParams(searchParams);
    params.set('page', safePage.toString());
    router.push(`?${params.toString()}`);
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
      cell: info => (
        <div className="flex flex-row">
          <Link variant="button-outline" href={`/admin/users/${info.row.original.id}`}>
            {t('common.labels.view')}
          </Link>
        </div>
      ),
    }),
  ];

  return (
    <>
      <DataTable data={users} columns={columns} enableGlobalSearch={true} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPageClick={() => handlePageChange(currentPage - 1)}
        onNextPageClick={() => handlePageChange(currentPage + 1)}
      />
    </>
  );
};

export default UserList;

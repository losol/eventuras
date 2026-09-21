'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';

import { UserName, useUserDetails } from '@/components/admin/user';
import { UserDto } from '@/lib/eventuras-sdk';

const columnHelper = createColumnHelper<UserDto>();
// Module-level, so the table doesn't remount the cell on every render.
const UserCell = ({ row }: { row: { original: UserDto } }) => <UserName user={row.original} />;

type UserListProps = {
  users: UserDto[];
  currentPage: number;
  totalPages: number;
  query: string;
};

const UserList: React.FC<UserListProps> = ({ users, currentPage, totalPages, query }) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(query);
  const lastPushedRef = useRef(query);
  const userDetails = useUserDetails();

  // Debounce the input → URL sync so typing one letter at a time doesn't
  // fire a server request per keystroke. Also resets ?page so a new search
  // doesn't land on an out-of-range page.
  useEffect(() => {
    if (input === lastPushedRef.current) return;
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (input) params.set('q', input);
      else params.delete('q');
      params.delete('page');
      lastPushedRef.current = input;
      router.push(`?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [input, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    if (!Number.isFinite(newPage)) return;
    const safePage = Math.min(totalPages, Math.max(1, newPage));
    const params = new URLSearchParams(searchParams);
    params.set('page', safePage.toString());
    router.push(`?${params.toString()}`);
  };

  const columns = [
    columnHelper.accessor('name', {
      header: t('admin.participantColumns.name'),
      cell: UserCell,
    }),
    columnHelper.accessor('email', {
      header: t('admin.participantColumns.email'),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('phoneNumber', {
      header: t('admin.participantColumns.telephone'),
      cell: info => info.getValue(),
    }),
  ];

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('common.labels.search').toString()}
          className="w-full max-w-md rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
        />
      </div>
      <DataTable
        data={users}
        columns={columns}
        onRowClick={row => row.original.id && userDetails?.open(row.original.id)}
      />
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

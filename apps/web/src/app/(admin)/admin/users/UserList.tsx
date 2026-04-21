'use client';
import { useEffect, useRef, useState } from 'react';
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
  query: string;
};

const UserList: React.FC<UserListProps> = ({ users, currentPage, totalPages, query }) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(query);
  const lastPushedRef = useRef(query);

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
      <div className="mb-4">
        <input
          type="search"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('common.labels.search').toString()}
          className="w-full max-w-md rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
        />
      </div>
      <DataTable data={users} columns={columns} />
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

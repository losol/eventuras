'use client';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Link } from '@eventuras/ratio-ui-next/Link';

import FatalError from '@/components/FatalError';
import { RegistrationDto, RegistrationDtoPageResponseDto } from '@/lib/eventuras-sdk';

import { getRegistrations } from './actions';
const columnHelper = createColumnHelper<RegistrationDto>();
const AdminRegistrationsList: React.FC = () => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<RegistrationDtoPageResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pageSize = 50;
  useEffect(() => {
    startTransition(async () => {
      const response = await getRegistrations(page, pageSize);
      if (response.ok && response.data) {
        setResult(response.data);
        setError(null);
      } else {
        setError(response.error);
        setResult(null);
      }
    });
  }, [page]);
  const renderRegistrationActions = (registration: RegistrationDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/registrations/${registration.registrationId}`}>
          {t('common.labels.view')}
        </Link>
      </div>
    );
  };
  const columns = [
    columnHelper.accessor('registrationId', {
      header: t('common.orders.labels.id').toString(),
      cell: info => (
        <Link href={`/admin/registrations/${info.row.original.registrationId}`}>
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('user.name', {
      header: t('common.labels.name').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('event.title', {
      header: t('common.orders.labels.time').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: t('admin.eventColumns.actions').toString(),
      cell: info => renderRegistrationActions(info.row.original),
    }),
  ];
  if (isPending && !result) return <Loading />;
  if (error) return <FatalError title="Failed to load registrations" description={error} />;
  if (!result)
    return (
      <FatalError title="No response from admin registrations" description="Response is null" />
    );
  return (
    <>
      <DataTable data={result.data ?? []} columns={columns} />
      <Pagination
        currentPage={page}
        totalPages={result.pages ?? 0}
        onPreviousPageClick={() => setPage(page - 1)}
        onNextPageClick={() => setPage(page + 1)}
      />
    </>
  );
};
export default AdminRegistrationsList;

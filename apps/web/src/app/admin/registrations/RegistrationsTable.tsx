'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { RegistrationDto } from '@eventuras/event-sdk';
import { Pagination } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import { Link } from '@eventuras/ratio-ui-next/Link';

const columnHelper = createColumnHelper<RegistrationDto>();

type RegistrationsTableProps = {
  registrations: RegistrationDto[];
  currentPage: number;
  totalPages: number;
};

export default function RegistrationsTable({ registrations, currentPage, totalPages }: RegistrationsTableProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

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

  return (
    <>
      <DataTable data={registrations} columns={columns} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPageClick={() => handlePageChange(currentPage - 1)}
        onNextPageClick={() => handlePageChange(currentPage + 1)}
      />
    </>
  );
}

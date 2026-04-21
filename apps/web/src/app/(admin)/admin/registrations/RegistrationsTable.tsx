'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';

import { RegistrationDto } from '@/lib/eventuras-sdk';

import RegistrationDrawer from './RegistrationDrawer';
const columnHelper = createColumnHelper<RegistrationDto>();
type RegistrationsTableProps = {
  registrations: RegistrationDto[];
  currentPage: number;
  totalPages: number;
};
export default function RegistrationsTable({
  registrations,
  currentPage,
  totalPages,
}: Readonly<RegistrationsTableProps>) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<number | null>(null);
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };
  const openDrawer = (registrationId: number | undefined) => {
    if (registrationId !== undefined) {
      setSelectedRegistrationId(registrationId);
    }
  };
  const columns = [
    columnHelper.accessor('registrationId', {
      header: t('common.orders.labels.id').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('user.name', {
      header: t('common.labels.name').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('event.title', {
      header: t('common.orders.labels.time').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: t('admin.eventColumns.actions').toString(),
      cell: info => (
        <div className="flex flex-row">
          <Button variant="outline" onClick={() => openDrawer(info.row.original.registrationId)}>
            {t('common.labels.view')}
          </Button>
        </div>
      ),
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
      <RegistrationDrawer
        registrationId={selectedRegistrationId}
        isOpen={selectedRegistrationId !== null}
        onClose={() => setSelectedRegistrationId(null)}
      />
    </>
  );
}

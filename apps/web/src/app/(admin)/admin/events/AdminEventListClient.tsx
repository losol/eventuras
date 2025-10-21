'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { EventDto } from '@eventuras/event-sdk';
import { Pagination } from '@eventuras/ratio-ui';
import { useRouter, useSearchParams } from 'next/navigation';

import { Link } from '@eventuras/ratio-ui-next/Link';

const columnHelper = createColumnHelper<EventDto>();

interface AdminEventListClientProps {
  events: EventDto[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  translations: {
    title: string;
    location: string;
    when: string;
    actions: string;
    view: string;
  };
}

export function AdminEventListClient({
  events,
  currentPage,
  totalPages,
  pageSize,
  translations,
}: AdminEventListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const renderEventItemActions = (info: EventDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/events/${info.id}`}>
          {translations.view}
        </Link>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('title', {
      header: translations.title,
      cell: info => <Link href={`/admin/events/${info.row.original.id}`}> {info.getValue()}</Link>,
    }),
    columnHelper.accessor('location', {
      header: translations.location,
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('dateStart', {
      header: translations.when,
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('id', {
      header: translations.actions,
      cell: info => renderEventItemActions(info.row.original),
    }),
  ];

  return (
    <>
      <DataTable data={events} columns={columns} pageSize={pageSize} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPageClick={() => handlePageChange(currentPage - 1)}
        onNextPageClick={() => handlePageChange(currentPage + 1)}
      />
    </>
  );
}

'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventCollectionDto } from '@/lib/eventuras-sdk';
const columnHelper = createColumnHelper<EventCollectionDto>();
type CollectionsTableProps = {
  collections: EventCollectionDto[];
  currentPage: number;
  totalPages: number;
};
export default function CollectionsTable({
  collections,
  currentPage,
  totalPages,
}: CollectionsTableProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };
  const renderCollectionActions = (collection: EventCollectionDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/collections/${collection.id}`}>
          {t('common.labels.view')}
        </Link>
      </div>
    );
  };
  const columns = [
    columnHelper.accessor('id', {
      header: t('common.labels.id').toString(),
      cell: info => (
        <Link href={`/admin/collections/${info.row.original.id}`}>{info.getValue()}</Link>
      ),
    }),
    columnHelper.accessor('name', {
      header: t('common.labels.name').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      header: t('admin.eventColumns.actions').toString(),
      cell: info => renderCollectionActions(info.row.original),
    }),
  ];
  return (
    <>
      <DataTable data={collections} columns={columns} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPageClick={() => handlePageChange(currentPage - 1)}
        onNextPageClick={() => handlePageChange(currentPage + 1)}
      />
    </>
  );
}

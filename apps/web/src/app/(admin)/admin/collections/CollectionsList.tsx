'use client';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { EventCollectionDto, EventCollectionDtoPageResponseDto } from '@eventuras/event-sdk';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Link } from '@eventuras/ratio-ui-next/Link';

import FatalError from '@/components/FatalError';

import { getCollections } from './actions';
const columnHelper = createColumnHelper<EventCollectionDto>();
const CollectionsList: React.FC = () => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<EventCollectionDtoPageResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pageSize = 100;
  useEffect(() => {
    startTransition(async () => {
      const response = await getCollections(page, pageSize);
      if (response.ok && response.data) {
        setResult(response.data);
        setError(null);
      } else {
        setError(response.error);
        setResult(null);
      }
    });
  }, [page]);
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
  if (isPending && !result) return <Loading />;
  if (error) return <FatalError title="Failed to load collections" description={error} />;
  if (!result)
    return <FatalError title="No response from admin collections" description="Response is null" />;
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
export default CollectionsList;

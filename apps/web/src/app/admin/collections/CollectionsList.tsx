'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { EventCollectionDto, OrderDto } from '@eventuras/sdk';
import FatalError from '@eventuras/ui/FatalError';
import Link from '@eventuras/ui/Link';
import Loading from '@eventuras/ui/Loading';
import Pagination from '@eventuras/ui/Pagination';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { formatDateSpan } from '@/utils/formatDate';

const columnHelper = createColumnHelper<EventCollectionDto>();

const CollectionsList: React.FC = () => {
  const organizationId = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
  const { t } = createTranslation();
  const [page, setPage] = useState(1);
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const pageSize = 100;
  const { loading, result } = useCreateHook(
    () =>
      sdk.eventCollection.getV3Eventcollections({
        page: page,
        count: pageSize,
        eventurasOrgId: organizationId,
      }),
    [page]
  );

  const renderCollectionActions = (collection: EventCollectionDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/collections/${collection.id}`}>
          {t('common:labels.view')}
        </Link>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('id', {
      header: t('common:labels.id').toString(),
      cell: info => (
        <Link href={`/admin/collections/${info.row.original.id}`}>{info.getValue()}</Link>
      ),
    }),
    columnHelper.accessor('name', {
      header: t('common:labels.name').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('id', {
      header: t('admin:eventColumns.actions').toString(),
      cell: info => renderCollectionActions(info.row.original),
    }),
  ];

  if (loading) return <Loading />;
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

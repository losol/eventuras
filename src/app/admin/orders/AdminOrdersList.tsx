'use client';

import { OrderDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import FatalError from '@/components/ui/FatalError';
import Link from '@/components/ui/Link';
import Loading from '@/components/ui/Loading';
import Pagination from '@/components/ui/Pagination';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { formatDateSpan } from '@/utils/formatDate';

const columnHelper = createColumnHelper<OrderDto>();

const AdminOrdersList: React.FC = () => {
  const organizationId = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
  const { t } = createTranslation();
  const [page, setPage] = useState(1);
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const pageSize = 50;
  const { loading, result } = useCreateHook(
    () =>
      sdk.orders.getV3Orders1({
        organizationId: organizationId,
        eventurasOrgId: organizationId,
        includeUser: true,
        includeRegistration: true,
        page,
        count: pageSize,
        ordering: ['orderId:desc'],
      }),
    [page]
  );

  const renderOrderActions = (order: OrderDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/orders/${order.orderId}`}>
          {t('common:labels.view')}
        </Link>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('orderId', {
      header: t('common:orders.labels.id').toString(),
      cell: info => (
        <Link href={`/admin/orders/${info.row.original.orderId}`}>{info.getValue()}</Link>
      ),
    }),
    columnHelper.accessor('user.name', {
      header: t('common:labels.name').toString(),
      cell: info => info.getValue(),
    }),

    columnHelper.accessor('time', {
      header: t('common:orders.labels.time').toString(),
      cell: info => formatDateSpan(info.row.original.time!.toString(), null, { showTime: true }),
    }),
    columnHelper.accessor('action', {
      header: t('admin:eventColumns.actions').toString(),
      cell: info => renderOrderActions(info.row.original),
    }),
  ];

  if (loading) return <Loading />;
  if (!result)
    return <FatalError title="No response from admin orders" description="Response is null" />;
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

export default AdminOrdersList;

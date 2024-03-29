'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { OrderDto } from '@eventuras/sdk';
import FatalError from '@eventuras/ui/FatalError';
import Loading from '@eventuras/ui/Loading';
import Pagination from '@eventuras/ui/Pagination';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import Link from '@/components/Link';
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
        ordering: ['time:desc'],
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
    columnHelper.accessor('status', {
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

'use client';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Link } from '@eventuras/ratio-ui-next/Link';

import FatalError from '@/components/FatalError';
import { OrderDto } from "@/lib/eventuras-sdk";

import { getOrders } from './actions';
const columnHelper = createColumnHelper<OrderDto>();
type OrdersResponse = {
  data?: OrderDto[];
  page?: number;
  count?: number;
  total?: number;
  pages?: number;
};
const AdminOrdersList: React.FC = () => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<OrdersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pageSize = 50;
  useEffect(() => {
    startTransition(async () => {
      const response = await getOrders(page, pageSize);
      if (response.ok && response.data) {
        setResult(response.data);
        setError(null);
      } else {
        setError(response.error);
        setResult(null);
      }
    });
  }, [page]);
  const renderOrderActions = (order: OrderDto) => {
    return (
      <div className="flex flex-row">
        <Link variant="button-outline" href={`/admin/orders/${order.orderId}`}>
          {t('common.labels.view')}
        </Link>
      </div>
    );
  };
  const columns = [
    columnHelper.accessor('orderId', {
      header: t('common.orders.labels.id').toString(),
      cell: info => (
        <Link href={`/admin/orders/${info.row.original.orderId}`}>{info.getValue()}</Link>
      ),
    }),
    columnHelper.accessor('user.name', {
      header: t('common.labels.name').toString(),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('time', {
      header: t('common.orders.labels.time').toString(),
      cell: info => formatDateSpan(info.row.original.time!.toString(), null, { showTime: true }),
    }),
    columnHelper.accessor('status', {
      header: t('admin.eventColumns.actions').toString(),
      cell: info => renderOrderActions(info.row.original),
    }),
  ];
  if (isPending && !result) return <Loading />;
  if (error) return <FatalError title="Failed to load orders" description={error} />;
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

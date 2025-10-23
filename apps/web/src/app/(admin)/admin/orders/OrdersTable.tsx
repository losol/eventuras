'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { OrderDto } from '@/lib/eventuras-sdk';
const columnHelper = createColumnHelper<OrderDto>();
type OrdersTableProps = {
  orders: OrderDto[];
  currentPage: number;
  totalPages: number;
};
export default function OrdersTable({ orders, currentPage, totalPages }: OrdersTableProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };
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
  return (
    <>
      <DataTable data={orders} columns={columns} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPageClick={() => handlePageChange(currentPage - 1)}
        onNextPageClick={() => handlePageChange(currentPage + 1)}
      />
    </>
  );
}

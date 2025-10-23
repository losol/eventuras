'use client';
import React from 'react';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Badge } from '@eventuras/ratio-ui/core/Badge';

import { ProductOrdersSummaryDto } from '@/lib/eventuras-sdk';
interface DeliverySummaryProps {
  deliverySummary: ProductOrdersSummaryDto[];
}
const DeliverySummary: React.FC<DeliverySummaryProps> = ({ deliverySummary }) => {
  const columnHelper = createColumnHelper<ProductOrdersSummaryDto>();
  const columns = [
    columnHelper.accessor(row => row.user?.name, {
      header: 'User Name',
      cell: info => info.getValue() || '',
    }),
    columnHelper.accessor(row => row.user?.email, {
      header: 'Email',
      cell: info => info.getValue() || '',
    }),
    columnHelper.accessor(row => row.user?.phoneNumber, {
      header: 'Phone',
      cell: info => info.getValue() || '',
    }),
    columnHelper.accessor('registrationId', {
      header: 'Registration',
      cell: info => <Badge>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('sumQuantity', {
      header: 'Quantity',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('registrationStatus', {
      header: 'Status',
      cell: info => info.getValue(),
      enableSorting: true,
    }),
  ];
  return <DataTable data={deliverySummary} columns={columns} pageSize={100} clientsidePagination />;
};
export default DeliverySummary;

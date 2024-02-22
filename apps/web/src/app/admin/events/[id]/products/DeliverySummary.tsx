'use client';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { ProductOrdersSummaryDto } from '@eventuras/sdk';
import Badge from '@eventuras/ui/Badge';
import React from 'react';

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

  return <DataTable data={deliverySummary} columns={columns} />;
};

export default DeliverySummary;

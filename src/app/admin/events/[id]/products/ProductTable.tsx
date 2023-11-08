import type { ProductDto } from '@losol/eventuras';

import DataTable, { createColumnHelper } from '@/components/ui/DataTable';

const columnHelper = createColumnHelper<ProductDto>();

type ProductTableProps = {
  products: ProductDto[];
};

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue() ?? 'N/A',
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: info => info.getValue() ?? 'N/A',
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: info => info.getValue()?.toFixed(2) ?? 'N/A', // Assuming price is a number and you want to format it
  }),
  columnHelper.accessor('vatPercent', {
    header: 'VAT',
    cell: info => `${info.getValue()}%` ?? 'N/A', // Assuming vatPercent is a number
  }),
  columnHelper.accessor('visibility', {
    header: 'Visibility',
    cell: info => info.getValue()?.toString() ?? 'N/A',
  }),
  columnHelper.accessor('minimumQuantity', {
    header: 'Minimum',
    cell: info => info.getValue()?.toString() ?? 'N/A',
  }),
  columnHelper.accessor('isMandatory', {
    header: 'Mandatory',
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  }),
  columnHelper.accessor('enableQuantity', {
    header: 'Quantity',
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  }),
];

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  return <DataTable columns={columns} data={products} />;
};

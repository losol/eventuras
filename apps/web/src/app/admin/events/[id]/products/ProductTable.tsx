import type { ProductDto } from '@eventuras/sdk';
import { IconPencil } from '@tabler/icons-react';

import Badge from '@/components/ui/Badge';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import Link from '@/components/ui/Link';

const columnHelper = createColumnHelper<ProductDto>();

interface ProductTableProps {
  products: ProductDto[];
  onEdit: (product: ProductDto) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit }) => {
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info =>
        (
          <Link href={`./products/${info.row.original.productId}`}>
            {info.getValue()} <Badge>{`${info.row.original.productId}`}</Badge>
          </Link>
        ) ?? 'N/A',
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: info => info.getValue() ?? 'N/A',
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => info.getValue()?.toFixed(0) ?? 'N/A',
    }),
    columnHelper.accessor('vatPercent', {
      header: 'VAT',
      cell: info => `${info.getValue()}%` ?? 'N/A',
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
    columnHelper.accessor('productId', {
      header: 'Edit',
      cell: info => (
        <div className="flex justify-center items-center">
          <button
            onClick={() => onEdit(info.row.original)}
            className="text-white bg-blue-500 hover:bg-blue-700 rounded p-1"
            aria-label="Edit"
            data-test-id="edit-product-button"
          >
            <IconPencil />
          </button>
        </div>
      ),
    }),
  ];

  return <DataTable columns={columns} data={products} />;
};

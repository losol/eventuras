import { createColumnHelper, DataTable } from '@eventuras/datatable';
import type { ProductDto } from '@eventuras/sdk';
import { Badge } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { IconEye, IconPencil } from '@tabler/icons-react';
import createTranslation from 'next-translate/createTranslation';

import Link from '@/components/Link';

const columnHelper = createColumnHelper<ProductDto>();

interface ProductTableProps {
  products: ProductDto[];
  onEdit: (product: ProductDto) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit }) => {
  const { t } = createTranslation();

  const columns = [
    columnHelper.accessor('name', {
      header: t('common:products.labels.name').toString(),
      cell: info =>
        (
          <Link href={`./products/${info.row.original.productId}`}>
            {info.getValue()} <Badge>{`${info.row.original.productId}`}</Badge>
          </Link>
        ),
    }),
    columnHelper.accessor('price', {
      header: t('common:products.labels.price').toString(),
      cell: info => {
        const value = info.getValue();
        return value != null ? `${value}` : 'N/A';
      },
    }),
    columnHelper.accessor('visibility', {
      header: t('common:products.labels.visibility').toString(),
      cell: info => info.getValue()?.toString() ?? 'N/A',
    }),
    columnHelper.accessor('minimumQuantity', {
      header: t('common:products.labels.minimum').toString(),
      cell: info => info.getValue()?.toString() ?? 'N/A',
    }),
    columnHelper.accessor('productId', {
      header: t('common:labels.menu').toString(),
      cell: info => (
        <div className="flex justify-center items-center">
          <Link
            href={`./products/${info.getValue()}`}
            className="text-white bg-blue-500 hover:bg-blue-700 rounded  "
            aria-label="View"
            {...{ [DATA_TEST_ID]: 'view-product-button' }}
          >
            <IconEye />
          </Link>
          <button
            onClick={() => onEdit(info.row.original)}
            className="text-white bg-blue-500 hover:bg-blue-700 rounded p-2"
            aria-label="Edit"
            {...{ [DATA_TEST_ID]: 'edit-product-button' }}
          >
            <IconPencil />
          </button>
        </div>
      ),
    }),
  ];

  return <DataTable columns={columns} data={products} />;
};

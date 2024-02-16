import type { ProductDto } from '@eventuras/sdk';
import { IconEye, IconPencil } from '@tabler/icons-react';
import createTranslation from 'next-translate/createTranslation';

import Badge from '@/components/ui/Badge';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import Link from '@/components/ui/Link';

const columnHelper = createColumnHelper<ProductDto>();

interface ProductTableProps {
  products: ProductDto[];
  onEdit: (product: ProductDto) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit }) => {
  const { t } = createTranslation();

  const columns = [
    columnHelper.accessor('name', {
      header: t("common:products.labels.name").toString(),
      cell: info =>
        (
          <Link href={`./products/${info.row.original.productId}`}>
            {info.getValue()} <Badge>{`${info.row.original.productId}`}</Badge>
          </Link>
        ) ?? 'N/A',
    }),
    columnHelper.accessor('price', {
      header: t("common:products.labels.price").toString(),
      cell: info => `${info.getValue()}` ?? 'N/A',
    }),
    columnHelper.accessor('visibility', {
      header: t("common:products.labels.visibility").toString(),
      cell: info => info.getValue()?.toString() ?? 'N/A',
    }),
    columnHelper.accessor('minimumQuantity', {
      header: t("common:products.labels.minimum").toString(),
      cell: info => info.getValue()?.toString() ?? 'N/A',
    }),
    columnHelper.accessor('productId', {
      header: t("common:labels.menu").toString(),
      cell: info => (
        <div className="flex justify-center items-center">
          <Link href={`./products/${info.getValue()}`} className="text-white bg-blue-500 hover:bg-blue-700 rounded  " aria-label="View" data-test-id="view-product-button">
            <IconEye />
          </Link>
          <button
            onClick={() => onEdit(info.row.original)}
            className="text-white bg-blue-500 hover:bg-blue-700 rounded p-2"
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

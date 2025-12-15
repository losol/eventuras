import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Eye, Pencil } from '@eventuras/ratio-ui/icons';
import { Box } from '@eventuras/ratio-ui/layout/Box';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { ProductDto } from '@/lib/eventuras-sdk';
const columnHelper = createColumnHelper<ProductDto>();
interface ProductTableProps {
  eventId: number;
  products: ProductDto[];
  onEdit: (product: ProductDto) => void;
}
export const ProductTable: React.FC<ProductTableProps> = ({ eventId, products, onEdit }) => {
  const t = useTranslations();
  const columns = [
    columnHelper.accessor('name', {
      header: t('common.products.labels.name').toString(),
      cell: info => (
        <Link
          href={`/admin/events/${eventId}/products/${info.row.original.productId}`}
          className="font-medium text-primary-700 dark:text-primary-400 hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('price', {
      header: t('common.products.labels.price').toString(),
      cell: info => {
        const value = info.getValue();
        return value != null ? (
          <Text as="span" className="font-medium tabular-nums">
            {value}
          </Text>
        ) : (
          <Text as="span" className="text-gray-400">
            —
          </Text>
        );
      },
    }),
    columnHelper.accessor('visibility', {
      header: t('common.products.labels.visibility').toString(),
      cell: info => {
        const visibility = info.getValue();
        if (!visibility) {
          return (
            <Text as="span" className="text-gray-400">
              —
            </Text>
          );
        }
        const isEvent = visibility === 'Event';
        return (
          <Badge variant={isEvent ? 'positive' : 'neutral'} className="!py-1 !px-2 !text-xs">
            {visibility}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('minimumQuantity', {
      header: t('common.products.labels.minimum').toString(),
      cell: info => {
        const value = info.getValue();
        return value != null ? (
          <Text as="span" className="tabular-nums">
            {value}
          </Text>
        ) : (
          <Text as="span" className="text-gray-400">
            —
          </Text>
        );
      },
    }),
    columnHelper.accessor('productId', {
      header: t('common.labels.actions').toString(),
      cell: info => (
        <Box className="flex justify-end items-center" gap="1">
          <Link
            href={`/admin/events/${eventId}/products/${info.row.original.productId}`}
            variant="button-outline"
            className="!p-2 !rounded-lg"
            aria-label={t('common.labels.view')}
            testId="view-product-button"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            padding="p-2"
            margin="m-0"
            onClick={() => onEdit(info.row.original)}
            ariaLabel={t('common.labels.edit')}
            testId="edit-product-button"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </Box>
      ),
    }),
  ];
  return <DataTable columns={columns} data={products} />;
};

import { createColumnHelper } from '@eventuras/datatable';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { ChevronDown, ChevronRight, FileText, ShoppingCart, User } from '@eventuras/ratio-ui/icons';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { ProductDto, RegistrationDto } from '@/lib/eventuras-sdk';

import LiveActionsMenu from './LiveActionsMenu';

const columnHelper = createColumnHelper<RegistrationDto>();

function renderProducts(registration: RegistrationDto) {
  if (!registration.products || registration.products.length === 0) {
    return '';
  }
  return registration.products
    .map(product => {
      const displayQuantity = product.product!.enableQuantity && product.quantity! > 1;
      return displayQuantity
        ? `${product.quantity} x ${product.product!.name}`
        : product.product!.name;
    })
    .join(', ');
}

interface ColumnConfig {
  t: (key: string) => string;
  eventProducts: ProductDto[];
  onProductsClick: (registration: RegistrationDto) => void;
  onStatusUpdate: (registration: RegistrationDto) => void;
  isLoadingRegistration: (registration: RegistrationDto) => boolean;
}

export function createParticipantColumns({ t, onStatusUpdate }: ColumnConfig) {
  return [
    columnHelper.display({
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      ),
    }),
    columnHelper.accessor('user.name', {
      id: 'user',
      header: t('admin.participantColumns.user'),
      cell: info => {
        const registration = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{registration.user?.name}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {registration.user?.phoneNumber}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {registration.user?.email}
            </span>
          </div>
        );
      },
      enableGlobalFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const user = row.original.user;
        if (!user) return false;

        const searchTerm = filterValue.toLowerCase();
        const name = user.name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const phone = user.phoneNumber?.toLowerCase() || '';

        return (
          name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm)
        );
      },
    }),
    columnHelper.accessor('products', {
      header: t('admin.participantColumns.products'),
      cell: info => renderProducts(info.row.original),
    }),
    columnHelper.display({
      id: 'live',
      header: t('admin.participantColumns.live'),
      cell: info => (
        <LiveActionsMenu registration={info.row.original} onStatusUpdate={onStatusUpdate} />
      ),
    }),
  ];
}

export function renderExpandedRow({
  registration,
  eventProducts,
  onProductsClick,
  isLoadingRegistration,
  t,
}: {
  registration: RegistrationDto;
  eventProducts: ProductDto[];
  onProductsClick: (registration: RegistrationDto) => void;
  isLoadingRegistration: (registration: RegistrationDto) => boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-2">
      {/* Left side: Metadata */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.labels.id')}:</span>
          <Badge>{registration.registrationId}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('admin.participantColumns.status')}:
          </span>
          <div className="flex gap-1">
            <Badge>{registration.type}</Badge>
            <Badge>{registration.status}</Badge>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        <Link variant="button-outline" href={`/admin/users/${registration.userId}`}>
          <User className="w-4 h-4" />
        </Link>
        <Link variant="button-outline" href={`/admin/registrations/${registration.registrationId}`}>
          <FileText className="w-4 h-4" />
        </Link>
        {eventProducts?.length !== 0 && (
          <Button variant="outline" onClick={() => onProductsClick(registration)}>
            {isLoadingRegistration(registration) ? (
              <Loading />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

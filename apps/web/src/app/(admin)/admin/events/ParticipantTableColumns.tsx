import { createColumnHelper } from '@eventuras/datatable';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { ChevronDown, ChevronRight, FileText, Pencil, User } from '@eventuras/ratio-ui/icons';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { ProductDto, RegistrationDto } from '@/lib/eventuras-types';

import FinishRegistrationButton from './FinishRegistrationButton';
import RegistrationStatusSelect from './RegistrationStatusSelect';

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

export function createParticipantColumns({
  t,
  eventProducts,
  onProductsClick,
  onStatusUpdate,
  isLoadingRegistration,
}: ColumnConfig) {
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
          <div className="flex items-start gap-2 -ml-1">
            <div className="flex flex-col">
              <span className="font-medium">{registration.user?.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {registration.user?.phoneNumber}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {registration.user?.email}
              </span>
            </div>
            <Link
              variant="button-text"
              href={`/admin/users/${registration.userId}`}
              className="p-1 h-auto"
            >
              <User className="w-4 h-4" />
            </Link>
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
      cell: info => {
        const registration = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <span>{renderProducts(registration)}</span>
            {eventProducts?.length !== 0 && (
              <Button
                variant="text"
                onClick={() => onProductsClick(registration)}
                className="p-1 h-auto"
              >
                {isLoadingRegistration(registration) ? <Loading /> : <Pencil className="w-4 h-4" />}
              </Button>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FinishRegistrationButton registration={row.original} onStatusUpdate={onStatusUpdate} />
        </div>
      ),
    }),
  ];
}

export function renderExpandedRow({
  registration,
  onStatusUpdate,
  t,
}: {
  registration: RegistrationDto;
  onStatusUpdate: (registration: RegistrationDto) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('admin.participantColumns.status')}:
        </span>
        <RegistrationStatusSelect registration={registration} onStatusUpdate={onStatusUpdate} />
      </div>

      {/* Metadata and Actions */}
      <div className="flex items-center justify-between gap-6">
        {/* Left side: Metadata */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.labels.id')}:
            </span>
            <Badge>{registration.registrationId}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('admin.participantColumns.type')}:
            </span>
            <Badge>{registration.type}</Badge>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          <Link
            variant="button-outline"
            href={`/admin/registrations/${registration.registrationId}`}
          >
            <FileText className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

import { createColumnHelper } from '@eventuras/datatable';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { FileText, ShoppingCart, User } from '@eventuras/ratio-ui/icons';

import { ProductDto, RegistrationDto } from "@/lib/eventuras-sdk";
import { ParticipationTypesKey } from '@/types';
import { participationMap } from '@/utils/api/mappers';

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

export function createParticipantColumns({
  t,
  eventProducts,
  onProductsClick,
  onStatusUpdate,
  isLoadingRegistration,
}: ColumnConfig) {
  return [
    columnHelper.display({
      header: t('common.labels.id'),
      cell: info => <Badge>{info.row.original.registrationId}</Badge>,
    }),
    columnHelper.accessor('user.name', {
      header: t('admin.participantColumns.name'),
    }),
    columnHelper.accessor('user.phoneNumber', {
      header: t('admin.participantColumns.telephone'),
    }),
    columnHelper.accessor('user.email', {
      header: t('admin.participantColumns.email'),
    }),
    columnHelper.accessor('products', {
      header: t('admin.participantColumns.products'),
      cell: info => renderProducts(info.row.original),
    }),
    columnHelper.accessor('status', {
      header: t('admin.participantColumns.status'),
      filterFn: (row, _columnId, value) => {
        const status = row.original.status!;
        const key = Object.keys(participationMap).filter(key => {
          const k = key as ParticipationTypesKey;
          const values: string[] = participationMap[k];
          return values.indexOf(status) > -1;
        })[0];
        return key?.toLowerCase() === value.toLowerCase();
      },
      cell: info => {
        const registration = info.row.original;
        return (
          <>
            <Badge>{registration.type}</Badge>
            &nbsp;
            <Badge>{registration.status}</Badge>
          </>
        );
      },
    }),
    columnHelper.display({
      id: 'live',
      header: t('admin.participantColumns.live'),
      cell: info => (
        <LiveActionsMenu registration={info.row.original} onStatusUpdate={onStatusUpdate} />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: t('admin.participantColumns.actions'),
      cell: info => {
        const registration = info.row.original;
        return (
          <div className="flex flex-col items-end">
            <div className="flex flex-row">
              <div className="mr-2">
                <Button variant="light">
                  <Link href={`/admin/users/${registration.userId}`}>
                    <User color="black" />
                  </Link>
                </Button>
              </div>
              <div className="mr-2">
                <Button variant="light">
                  <Link href={`/admin/registrations/${registration.registrationId}`}>
                    <FileText color="black" />
                  </Link>
                </Button>
              </div>
              {eventProducts?.length !== 0 && (
                <Button variant="light" onClick={() => onProductsClick(registration)}>
                  {isLoadingRegistration(registration) ? (
                    <Loading />
                  ) : (
                    <ShoppingCart color="black" />
                  )}
                </Button>
              )}
            </div>
          </div>
        );
      },
    }),
  ];
}

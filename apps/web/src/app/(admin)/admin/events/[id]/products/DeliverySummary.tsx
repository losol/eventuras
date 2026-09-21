'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { createColumnHelper, DataTable } from '@eventuras/datatable';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { ToggleButtonGroup, ToggleButtonOption } from '@eventuras/ratio-ui/core/ToggleButtonGroup';

import { UserName } from '@/components/admin/user';
import { ProductOrdersSummaryDto } from '@/lib/eventuras-sdk';
import { ParticipationTypes, ParticipationTypesKey } from '@/types';
import { participationGroupOf, registrationBadgeStatus } from '@/utils/registration-helpers';

// Module-level, so the table doesn't remount the cell on every render.
const UserCell = ({ row }: { row: { original: ProductOrdersSummaryDto } }) => (
  <UserName user={row.original.user} />
);

interface DeliverySummaryProps {
  deliverySummary: ProductOrdersSummaryDto[];
}

const DeliverySummary: React.FC<DeliverySummaryProps> = ({ deliverySummary }) => {
  const t = useTranslations();
  // Same default as the participant list: cancellations are not what you came for.
  const [filter, setFilter] = useState<ParticipationTypesKey | null>(ParticipationTypes.active);

  // Counted from the rows themselves rather than the event statistics, so the
  // numbers on the toggles always describe what the table can show.
  const counts = useMemo(() => {
    const tally: Record<ParticipationTypesKey, number> = {
      [ParticipationTypes.active]: 0,
      [ParticipationTypes.waitingList]: 0,
      [ParticipationTypes.cancelled]: 0,
    };
    for (const row of deliverySummary) {
      const group = participationGroupOf(row.registrationStatus);
      if (group) tally[group] += 1;
    }
    return tally;
  }, [deliverySummary]);

  const rows = useMemo(() => {
    if (!filter) return deliverySummary;
    return deliverySummary.filter(row => participationGroupOf(row.registrationStatus) === filter);
  }, [deliverySummary, filter]);

  const options: ToggleButtonOption[] = Object.keys(ParticipationTypes).map(key => ({
    value: key,
    label: t(`common.labels.${key}`),
    count: counts[key as ParticipationTypesKey],
  }));

  const columnHelper = createColumnHelper<ProductOrdersSummaryDto>();
  const columns = [
    columnHelper.accessor(row => row.user?.name, {
      header: t('admin.participantColumns.name'),
      cell: UserCell,
    }),
    // No mailto: contacting a participant belongs in the app, not the reader's mail client.
    columnHelper.accessor(row => row.user?.email, {
      header: t('admin.participantColumns.email'),
      cell: info => info.getValue() || '',
    }),
    columnHelper.accessor(row => row.user?.phoneNumber, {
      header: t('admin.participantColumns.telephone'),
      cell: info => {
        const phone = info.getValue();
        return phone ? (
          <a href={`tel:${phone}`} className="hover:underline">
            {phone}
          </a>
        ) : (
          ''
        );
      },
    }),
    columnHelper.accessor('registrationId', {
      header: t('admin.products.columns.registration'),
      cell: info => <Badge>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('sumQuantity', {
      header: t('admin.products.columns.quantity'),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('registrationStatus', {
      header: t('admin.participantColumns.status'),
      cell: info => {
        const status = info.getValue();
        return status ? (
          <Badge variant="subtle" status={registrationBadgeStatus(status)}>
            {status}
          </Badge>
        ) : (
          ''
        );
      },
    }),
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      pageSize={100}
      clientsidePagination
      renderToolbar={(searchInput: React.ReactNode) => (
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <ToggleButtonGroup
            options={options}
            selectedKeys={filter ? [filter] : []}
            onSelectionChange={keys =>
              setFilter(([...keys][0] as ParticipationTypesKey | undefined) ?? null)
            }
            aria-label={t('common.labels.participationStatus')}
          />
          {searchInput}
        </div>
      )}
    />
  );
};
export default DeliverySummary;

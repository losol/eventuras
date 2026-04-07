'use client';

/* eslint-disable react/prop-types */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';
import { NumberCard } from '@eventuras/ratio-ui/visuals/NumberCard';

import { RegistrationDto, RegistrationStatus as RegistrationStatusType } from '@/lib/eventuras-sdk';
import { OrderStatus, RegistrationStatus } from '@/lib/eventuras-types';

import Registration from '../../registrations/Registration';

type EconomySectionProps = {
  participants: RegistrationDto[];
};

type OrderStatistics = {
  totalOrders: number;
  totalRevenue: number;
  draftOrders: number;
  verifiedOrders: number;
  invoicedOrders: number;
  cancelledOrders: number;
};

// Define the order for status groups
const STATUS_GROUP_CONFIG: {
  status: RegistrationStatusType;
  translationKey: string;
}[] = [
  { status: RegistrationStatus.VERIFIED, translationKey: 'common.registrations.labels.verified' },
  { status: RegistrationStatus.DRAFT, translationKey: 'common.registrations.labels.draft' },
  { status: RegistrationStatus.ATTENDED, translationKey: 'common.registrations.labels.attended' },
  { status: RegistrationStatus.FINISHED, translationKey: 'common.registrations.labels.finished' },
  {
    status: RegistrationStatus.WAITING_LIST,
    translationKey: 'common.registrations.labels.waitingList',
  },
  {
    status: RegistrationStatus.NOT_ATTENDED,
    translationKey: 'common.registrations.labels.notAttended',
  },
  {
    status: RegistrationStatus.CANCELLED,
    translationKey: 'common.registrations.labels.cancelled',
  },
];

const EconomySection: React.FC<EconomySectionProps> = ({ participants }) => {
  const t = useTranslations();

  // Calculate statistics from all registrations
  const statistics = useMemo((): OrderStatistics => {
    const stats: OrderStatistics = {
      totalOrders: 0,
      totalRevenue: 0,
      draftOrders: 0,
      verifiedOrders: 0,
      invoicedOrders: 0,
      cancelledOrders: 0,
    };

    for (const registration of participants) {
      const orders = registration.orders || [];
      const isRegistrationCancelled = registration.status === RegistrationStatus.CANCELLED;

      for (const order of orders) {
        stats.totalOrders++;

        // Only count revenue from non-cancelled registrations
        if (!isRegistrationCancelled) {
          const orderTotal =
            order.items?.reduce((sum: number, item) => {
              const qty = Number(item.quantity ?? 0);
              const price = Number(item.product?.price ?? 0);
              return sum + qty * price;
            }, 0) ?? 0;
          stats.totalRevenue += orderTotal;
        }

        // Count by status
        switch (order.status) {
          case OrderStatus.DRAFT:
            stats.draftOrders++;
            break;
          case OrderStatus.VERIFIED:
            stats.verifiedOrders++;
            break;
          case OrderStatus.INVOICED:
            stats.invoicedOrders++;
            break;
          case OrderStatus.CANCELLED:
            stats.cancelledOrders++;
            break;
        }
      }
    }

    return stats;
  }, [participants]);

  // Group participants by registration status
  const groupedParticipants = useMemo(() => {
    const groups = new Map<RegistrationStatusType, RegistrationDto[]>();
    for (const registration of participants) {
      const status: RegistrationStatusType = registration.status ?? RegistrationStatus.DRAFT;
      const existing = groups.get(status) || [];
      existing.push(registration);
      groups.set(status, existing);
    }
    return groups;
  }, [participants]);

  if (participants.length === 0) {
    return (
      <Stack gap="xl" className="py-8">
        <p className="text-gray-500">{t('admin.economy.labels.noOrders')}</p>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" className="py-8">
      {/* Summary */}
      <Grid cols={{ sm: 2, md: 2 }}>
        <NumberCard
          number={statistics.totalOrders}
          label={t('admin.economy.statistics.totalOrders')}
          variant="outline"
        />
        <NumberCard
          number={Number.parseFloat(statistics.totalRevenue.toFixed(2))}
          label={`${t('admin.economy.statistics.totalRevenue')} (kr)`}
          variant="outline"
        />
      </Grid>

      {/* Order status breakdown */}
      <Grid cols={{ sm: 2, md: 4 }}>
        <NumberCard
          number={statistics.draftOrders}
          label={t('admin.economy.statistics.draftOrders')}
          variant="outline"
        />
        <NumberCard
          number={statistics.verifiedOrders}
          label={t('admin.economy.statistics.verifiedOrders')}
          variant="outline"
        />
        <NumberCard
          number={statistics.invoicedOrders}
          label={t('admin.economy.statistics.invoicedOrders')}
          variant="outline"
        />
        <NumberCard
          number={statistics.cancelledOrders}
          label={t('admin.economy.statistics.cancelledOrders')}
          variant="outline"
        />
      </Grid>

      {/* Registrations grouped by status */}
      {STATUS_GROUP_CONFIG.map(({ status, translationKey }) => {
        const group = groupedParticipants.get(status);
        if (!group || group.length === 0) return null;

        return (
          <Stack key={status} gap="md">
            <Heading as="h2">
              {t(translationKey)} ({group.length})
            </Heading>
            {group.map(registration => (
              <Card key={registration.registrationId} className="p-6">
                <Registration
                  registration={registration}
                  adminMode={true}
                  showProducts={false}
                  showNotes={false}
                  editMode={false}
                  userNameHeading={true}
                />
              </Card>
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
};

export default EconomySection;

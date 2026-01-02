'use client';

/* eslint-disable react/prop-types */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { NumberCard } from '@eventuras/ratio-ui/visuals/NumberCard';

import { RegistrationDto } from '@/lib/eventuras-sdk';

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
      const isRegistrationCancelled = registration.status === 'Cancelled';

      for (const order of orders) {
        stats.totalOrders++;

        // Only count revenue from non-cancelled registrations
        if (!isRegistrationCancelled) {
          const orderTotal =
            order.items?.reduce(
              (sum: number, item: { quantity?: number; product?: { price?: number } }) =>
                sum + (item.quantity ?? 0) * (item.product?.price ?? 0),
              0
            ) ?? 0;
          stats.totalRevenue += orderTotal;
        }

        // Count by status
        switch (order.status) {
          case 'Draft':
            stats.draftOrders++;
            break;
          case 'Verified':
            stats.verifiedOrders++;
            break;
          case 'Invoiced':
            stats.invoicedOrders++;
            break;
          case 'Cancelled':
            stats.cancelledOrders++;
            break;
        }
      }
    }

    return stats;
  }, [participants]);

  if (participants.length === 0) {
    return (
      <div className="py-8">
        <p className="text-gray-500">{t('admin.economy.labels.noOrders')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <NumberCard
          number={statistics.totalOrders}
          label={t('admin.economy.statistics.totalOrders')}
        />
        <NumberCard
          number={Number.parseFloat(statistics.totalRevenue.toFixed(2))}
          label={`${t('admin.economy.statistics.totalRevenue')} (kr)`}
          backgroundColorClass="bg-green-50 dark:bg-green-900/20"
        />
        <NumberCard
          number={statistics.draftOrders}
          label={t('admin.economy.statistics.draftOrders')}
        />
        <NumberCard
          number={statistics.verifiedOrders}
          label={t('admin.economy.statistics.verifiedOrders')}
          backgroundColorClass="bg-green-50 dark:bg-green-900/20"
        />
        <NumberCard
          number={statistics.invoicedOrders}
          label={t('admin.economy.statistics.invoicedOrders')}
          backgroundColorClass="bg-blue-50 dark:bg-blue-900/20"
        />
        <NumberCard
          number={statistics.cancelledOrders}
          label={t('admin.economy.statistics.cancelledOrders')}
          backgroundColorClass="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Registrations List */}
      <div className="space-y-6">
        <Heading as="h2">{t('common.labels.registrations')}</Heading>
        {participants.map(registration => (
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
      </div>
    </div>
  );
};

export default EconomySection;

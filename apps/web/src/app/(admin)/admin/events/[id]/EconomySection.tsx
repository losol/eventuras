'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { OrderDto, RegistrationDto } from '@/lib/eventuras-sdk';

import Order from '../../orders/Order';

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

type UserOrderGroup = {
  userId: string;
  userName: string;
  userEmail: string;
  registrations: Array<{
    registration: RegistrationDto;
    orders: OrderDto[];
  }>;
};

const EconomySection: React.FC<EconomySectionProps> = ({ participants }) => {
  const t = useTranslations();

  // Group participants by user
  const userGroups = useMemo(() => {
    const groups = new Map<string, UserOrderGroup>();

    for (const participant of participants) {
      const userId = participant.userId || 'unknown';
      const userName = participant.user?.name || 'Unknown User';
      const userEmail = participant.user?.email || '';

      if (!groups.has(userId)) {
        groups.set(userId, {
          userId,
          userName,
          userEmail,
          registrations: [],
        });
      }

      const group = groups.get(userId)!;
      group.registrations.push({
        registration: participant,
        orders: participant.orders || [],
      });
    }

    return Array.from(groups.values());
  }, [participants]);

  // Calculate statistics
  const statistics = useMemo((): OrderStatistics => {
    const stats: OrderStatistics = {
      totalOrders: 0,
      totalRevenue: 0,
      draftOrders: 0,
      verifiedOrders: 0,
      invoicedOrders: 0,
      cancelledOrders: 0,
    };

    for (const group of userGroups) {
      for (const { orders } of group.registrations) {
        for (const order of orders) {
          stats.totalOrders++;

          // Calculate order total
          const orderTotal =
            order.items?.reduce(
              (sum, item) => sum + (item.quantity ?? 0) * (item.product?.price ?? 0),
              0
            ) ?? 0;
          stats.totalRevenue += orderTotal;

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
    }

    return stats;
  }, [userGroups]);

  if (userGroups.length === 0) {
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
        <Card className="p-4">
          <div className="text-sm text-gray-600">{t('admin.economy.statistics.totalOrders')}</div>
          <div className="text-2xl font-bold">{statistics.totalOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">{t('admin.economy.statistics.totalRevenue')}</div>
          <div className="text-2xl font-bold">{statistics.totalRevenue.toFixed(2)} kr</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">{t('admin.economy.statistics.draftOrders')}</div>
          <div className="text-2xl font-bold">{statistics.draftOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">
            {t('admin.economy.statistics.verifiedOrders')}
          </div>
          <div className="text-2xl font-bold">{statistics.verifiedOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">
            {t('admin.economy.statistics.invoicedOrders')}
          </div>
          <div className="text-2xl font-bold">{statistics.invoicedOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">
            {t('admin.economy.statistics.cancelledOrders')}
          </div>
          <div className="text-2xl font-bold">{statistics.cancelledOrders}</div>
        </Card>
      </div>

      {/* User Groups */}
      <div className="space-y-6">
        {userGroups.map(group => (
          <Card key={group.userId} className="p-6">
            <div className="mb-4">
              <Heading as="h3" className="text-lg">
                {group.userName}
              </Heading>
              <p className="text-sm text-gray-600">{group.userEmail}</p>
            </div>

            {group.registrations.map(({ registration, orders }) => (
              <div key={registration.registrationId} className="mt-4 space-y-4">
                {orders.map(order => (
                  <Order key={order.orderId} order={order} admin={true} />
                ))}

                {orders.length === 0 && (
                  <p className="text-sm text-gray-500">{t('admin.products.labels.noOrders')}</p>
                )}
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EconomySection;

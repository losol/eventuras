import type { OrderDto, RegistrationDto } from '@/lib/eventuras-sdk';

export type OrderStatistics = {
  totalOrders: number;
  totalRevenue: number;
  draftOrders: number;
  verifiedOrders: number;
  invoicedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
};

export function orderTotal(order: OrderDto): number {
  return (
    order.items?.reduce(
      (sum, item) => sum + (item.quantity ?? 0) * (item.product?.price ?? 0),
      0
    ) ?? 0
  );
}

/** Cancelled and refunded orders carry no revenue. */
function countsAsRevenue(order: OrderDto): boolean {
  return order.status !== 'Cancelled' && order.status !== 'Refunded';
}

/** Sum of a registration's orders, leaving out cancelled and refunded ones. */
export function registrationTotal(registration: RegistrationDto): number {
  return (registration.orders ?? [])
    .filter(countsAsRevenue)
    .reduce((sum, order) => sum + orderTotal(order), 0);
}

/**
 * Order counts by status and revenue across registrations. Revenue skips
 * cancelled registrations and cancelled/refunded orders; the status counters
 * cover every `OrderStatus`, so they add up to `totalOrders`.
 */
export function computeOrderStatistics(registrations: RegistrationDto[]): OrderStatistics {
  const stats: OrderStatistics = {
    totalOrders: 0,
    totalRevenue: 0,
    draftOrders: 0,
    verifiedOrders: 0,
    invoicedOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
  };

  for (const registration of registrations) {
    const isRegistrationCancelled = registration.status === 'Cancelled';

    for (const order of registration.orders ?? []) {
      stats.totalOrders++;
      if (!isRegistrationCancelled && countsAsRevenue(order)) {
        stats.totalRevenue += orderTotal(order);
      }

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
        case 'Refunded':
          stats.refundedOrders++;
          break;
      }
    }
  }

  return stats;
}

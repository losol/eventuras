import type { EventStatisticsDto, OrderLineModel } from '@/lib/eventuras-sdk';

/**
 * Convert selected products map to OrderLineModel array
 * Helper function for registration actions
 */
export const productMapToOrderLineModel = (
  selectedProducts?: Map<string, number>
): OrderLineModel[] => {
  return selectedProducts
    ? (Array.from(selectedProducts, ([productId, quantity]) => ({
        productId: Number.parseInt(productId, 10),
        quantity,
      })) as OrderLineModel[])
    : [];
};

/** Active registrations: everything except the waiting list and cancellations. */
export const activeRegistrations = (statistics?: EventStatisticsDto): number => {
  const byStatus = statistics?.byStatus;
  if (!byStatus) return 0;
  return (
    (byStatus.draft ?? 0) +
    (byStatus.verified ?? 0) +
    (byStatus.attended ?? 0) +
    (byStatus.finished ?? 0) +
    (byStatus.notAttended ?? 0)
  );
};

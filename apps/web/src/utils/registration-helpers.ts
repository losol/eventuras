import type { EventStatisticsDto, OrderLineModel } from '@/lib/eventuras-sdk';
import type { RegistrationStatus } from '@/lib/eventuras-types';
import { ParticipationTypes, type ParticipationTypesKey } from '@/types';
import { participationMap } from '@/utils/api/mappers';

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

/** Which participation group a registration status belongs to, or undefined if none. */
export const participationGroupOf = (status?: string | null): ParticipationTypesKey | undefined =>
  (Object.keys(participationMap) as ParticipationTypesKey[]).find(key =>
    participationMap[key].includes(status as RegistrationStatus)
  );

/** Badge colour for a participation group: active reads as fine, the rest as attention. */
export const participationBadgeStatus = (group?: ParticipationTypesKey) => {
  switch (group) {
    case ParticipationTypes.active:
      return 'success' as const;
    case ParticipationTypes.waitingList:
      return 'warning' as const;
    case ParticipationTypes.cancelled:
      return 'error' as const;
    default:
      return 'neutral' as const;
  }
};

export const registrationBadgeStatus = (status?: string | null) =>
  participationBadgeStatus(participationGroupOf(status));

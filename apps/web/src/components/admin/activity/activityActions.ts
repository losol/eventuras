'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import { BusinessEventDto, getV3BusinessEvents } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:admin:activity',
  context: { module: 'activityActions' },
});

const MAX_COUNT = 100;

/** Newest business events recorded on an event, across its registrations and orders. */
export async function fetchEventActivity(
  eventUuid: string,
  count = MAX_COUNT
): Promise<ServerActionResult<BusinessEventDto[]>> {
  // Server action input is untrusted — keep the page size within bounds.
  const safeCount = Math.min(Math.max(Math.trunc(count) || 1, 1), MAX_COUNT);

  try {
    const organizationId = getOrganizationId();
    const response = await getV3BusinessEvents({
      client,
      headers: { 'Eventuras-Org-Id': organizationId },
      query: { EventInfoUuid: eventUuid, Count: safeCount },
    });

    if (response.error || !response.data) {
      logger.error({ eventUuid, error: response.error }, 'Failed to load event activity');
      return actionError('Failed to load event activity');
    }

    return actionSuccess(response.data.data ?? []);
  } catch (error) {
    logger.error({ eventUuid, error }, 'Failed to load event activity');
    return actionError('Failed to load event activity');
  }
}

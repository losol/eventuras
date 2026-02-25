'use server';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { EventDto } from '@/lib/eventuras-sdk';
import { getV3Events } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:actions',
  context: { module: 'EventActions' },
});

/**
 * Fetch events for autocomplete/lookup
 * This is used by client components that need to search/filter events
 */
export async function fetchEventsForLookup(
  organizationId?: number
): Promise<ServerActionResult<EventDto[]>> {
  const orgId = organizationId ?? getOrganizationId();

  if (!orgId) {
    const errorMsg = 'Organization ID not configured';
    logger.error({ orgId }, errorMsg);
    return actionError(errorMsg, 'MISSING_ORG_ID');
  }

  logger.info({ organizationId: orgId }, 'Fetching events for lookup');

  try {
    const response = await getV3Events({
      query: {
        OrganizationId: orgId,
      },
      headers: {
        'Eventuras-Org-Id': orgId,
      },
    });

    if (!response.data?.data) {
      logger.error(
        {
          organizationId: orgId,
          error: response.error,
        },
        'Failed to fetch events'
      );
      return actionError('Failed to fetch events');
    }

    logger.info(
      { organizationId: orgId, count: response.data.data.length },
      'Events fetched successfully'
    );
    return actionSuccess(response.data.data);
  } catch (error) {
    logger.error({ error, organizationId: orgId }, 'Unexpected error fetching events');
    return actionError('An unexpected error occurred');
  }
}

'use server';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import type { RegistrationDto } from '@eventuras/event-sdk';
import { client, getV3Registrations } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { configureEventurasClient } from '@/lib/eventuras-client';

const logger = Logger.create({
  namespace: 'web:actions',
  context: { module: 'RegistrationActions' },
});

/**
 * Get organization ID from config
 */
function getOrganizationId(): number | null {
  const orgId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;

  if (typeof orgId === 'number') {
    return orgId;
  }

  if (typeof orgId === 'string' && orgId.trim() !== '') {
    const parsed = parseInt(orgId, 10);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

/**
 * Fetch user registrations for a specific event
 * Used by the event registration flow to check if user is already registered
 */
export async function fetchUserEventRegistrations(
  userId: string,
  eventId: number
): Promise<ServerActionResult<RegistrationDto[]>> {
  await configureEventurasClient();

  const orgId = getOrganizationId();

  if (!orgId) {
    const errorMsg = 'Organization ID not configured';
    logger.error({ orgId }, errorMsg);
    return actionError(errorMsg, 'MISSING_ORG_ID');
  }

  logger.info({ userId, eventId, organizationId: orgId }, 'Fetching user event registrations');

  try {
    const response = await getV3Registrations({
      client,
      query: {
        UserId: userId,
        EventId: eventId,
        IncludeProducts: true,
        IncludeEventInfo: true,
        IncludeOrders: true,
        IncludeUserInfo: true,
      },
      headers: {
        'Eventuras-Org-Id': orgId,
      },
    });

    if (!response.data?.data) {
      logger.error(
        {
          userId,
          eventId,
          organizationId: orgId,
          error: response.error,
        },
        'Failed to fetch user event registrations'
      );
      return actionError('Failed to fetch registrations');
    }

    logger.info(
      {
        userId,
        eventId,
        organizationId: orgId,
        count: response.data.data.length,
      },
      'User event registrations fetched successfully'
    );

    return actionSuccess(response.data.data);
  } catch (error) {
    logger.error(
      { error, userId, eventId, organizationId: orgId },
      'Unexpected error fetching user event registrations'
    );
    return actionError('An unexpected error occurred');
  }
}

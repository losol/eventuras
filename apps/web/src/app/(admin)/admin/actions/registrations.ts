'use server';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { RegistrationDto } from '@/lib/eventuras-sdk';
import { client, getV3Registrations } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:actions',
  context: { module: 'RegistrationActions' },
});

/**
 * Fetch user registrations for a specific event
 * Used by the event registration flow to check if user is already registered
 */
export async function fetchUserEventRegistrations(
  userId: string,
  eventId: number
): Promise<ServerActionResult<RegistrationDto[]>> {
  const orgId = getOrganizationId();

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

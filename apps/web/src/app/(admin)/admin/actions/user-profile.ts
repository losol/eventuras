'use server';

import { getV3Userprofile } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';

const logger = Logger.create({
  namespace: 'web:actions:user-profile',
  context: { module: 'UserProfileActions' },
});

/**
 * Helper function to extract organization ID from app config
 */
function getOrganizationId(): number | null {
  const orgId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;

  if (typeof orgId === 'number') {
    return orgId;
  }

  if (typeof orgId === 'string' && orgId.trim() !== '') {
    const parsed = parseInt(orgId, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Fetches the current user's profile
 */
export async function fetchUserProfile() {
  const organizationId = getOrganizationId();

  if (organizationId === null) {
    logger.error('Organization ID not configured');
    throw new Error('Organization ID not configured');
  }

  logger.info({ organizationId }, 'Fetching user profile...');

  try {
    const response = await getV3Userprofile({
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
    });

    if (!response.data) {
      logger.error(
        {
          error: response.error,
          organizationId,
        },
        'Failed to fetch user profile'
      );
      throw new Error('Failed to fetch user profile');
    }

    logger.info('User profile fetched successfully');
    return response.data;
  } catch (error) {
    logger.error({ error, organizationId }, 'Unexpected error fetching user profile');
    throw error;
  }
}

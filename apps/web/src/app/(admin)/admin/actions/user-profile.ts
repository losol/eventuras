'use server';

import { Logger } from '@eventuras/logger';

import { getV3Userprofile } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:actions:user-profile',
  context: { module: 'UserProfileActions' },
});

/**
 * Fetches the current user's profile
 */
export async function fetchUserProfile() {
  const organizationId = getOrganizationId();

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

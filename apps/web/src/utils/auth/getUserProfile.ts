'use server';

import { Logger } from '@eventuras/logger';

import { getV3Userprofile, type UserDto } from '@/lib/eventuras-sdk';

const logger = Logger.create({ namespace: 'web:utils:getUserProfile' });

export type UserProfileResult = {
  userProfile?: UserDto;
  error?: {
    message: string;
    detail?: string;
  };
};

/**
 * Get the current user's profile from the backend API.
 * Server action that can be called from client components.
 */
export async function getUserProfile(): Promise<UserProfileResult> {
  try {
    logger.debug('Fetching user profile');
    const result = await getV3Userprofile();

    if (result.error) {
      logger.warn({ error: result.error }, 'Failed to fetch user profile');

      return {
        error: {
          message: 'Failed to fetch user profile',
          detail: result.error.toString(),
        },
      };
    }

    logger.info({ userId: result.data?.id }, 'User profile fetched successfully');

    return {
      userProfile: result.data,
    };
  } catch (err) {
    logger.error({ error: err }, 'Exception while fetching user profile');

    return {
      error: {
        message: 'Exception while fetching user profile',
        detail: (err as Error).message,
      },
    };
  }
}

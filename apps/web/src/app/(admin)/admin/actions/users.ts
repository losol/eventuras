'use server';

import { Logger } from '@eventuras/logger';

import { getV3Users, type UserDto } from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:actions',
  context: { module: 'UserActions' },
});

/**
 * Search for users by query string
 */
export async function searchUsers(query: string): Promise<UserDto[]> {
  try {
    logger.debug({ query }, 'Searching for users');

    const result = await getV3Users({ query: { Query: query } });

    if (!result.data) {
      logger.error({ error: result.error, query }, 'Failed to search users');
      return [];
    }

    return result.data.data ?? [];
  } catch (error) {
    logger.error({ error, query }, 'Unexpected error searching users');
    return [];
  }
}

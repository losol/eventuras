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
    // Validate query length
    if (!query || query.trim().length < 2) {
      logger.debug({ queryLength: query?.length ?? 0 }, 'Query too short, skipping search');
      return [];
    }

    const trimmedQuery = query.trim();
    logger.info({ queryLength: trimmedQuery.length }, 'Searching for users');

    const result = await getV3Users({ query: { Query: trimmedQuery } });

    if (!result.data) {
      logger.error({ error: result.error }, 'Failed to search users');
      return [];
    }

    const users = result.data.data ?? [];
    logger.info({ count: users.length }, 'User search completed');

    return users;
  } catch (error) {
    logger.error({ error }, 'Unexpected error searching users');
    return [];
  }
}

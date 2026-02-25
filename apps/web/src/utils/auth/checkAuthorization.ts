'use server';

import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  getV3OrganizationsByOrganizationIdMembersByUserIdRoles,
  getV3UsersMe,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({ namespace: 'web:admin', context: { module: 'checkAuthorization' } });

export interface AuthorizationResult {
  authorized: boolean;
  userId?: string;
  roles?: string[];
  error?: string;
}

/**
 * Server action to check if the current user has a specific role in the organization.
 * Uses event-sdk directly with authentication from cookies.
 *
 * @param requiredRole - The role name required (e.g., 'Admin', 'SuperAdmin')
 * @returns Authorization result with user info and roles
 */
export async function checkAuthorization(requiredRole: string): Promise<AuthorizationResult> {
  const ORGANIZATION_ID = getOrganizationId();
  try {
    // Get current user using configured client
    const userResult = await getV3UsersMe({ client });

    if (userResult.error || !userResult.data) {
      logger.warn({ error: userResult.error }, 'Failed to get current user');
      return {
        authorized: false,
        error: 'Not authenticated',
      };
    }

    const user = userResult.data;
    const userId = user.id;

    if (!userId) {
      logger.warn('User ID not found in response');
      return {
        authorized: false,
        error: 'Invalid user data',
      };
    }

    // Get user's roles in the organization using configured client
    const rolesResult = await getV3OrganizationsByOrganizationIdMembersByUserIdRoles({
      client,
      path: {
        organizationId: ORGANIZATION_ID,
        userId: userId,
      },
      headers: {
        'Eventuras-Org-Id': ORGANIZATION_ID,
      },
    });

    if (rolesResult.error || !rolesResult.data) {
      logger.warn(
        { error: rolesResult.error, userId },
        'Failed to get user roles for organization'
      );
      return {
        authorized: false,
        userId,
        error: 'Failed to check roles',
      };
    }

    const roles = rolesResult.data;

    // Check if user has the required role
    const hasRole = roles.includes(requiredRole);

    logger.info(
      {
        userId,
        requiredRole,
        userRoles: roles,
        authorized: hasRole,
      },
      hasRole ? 'User authorized' : 'User not authorized'
    );

    return {
      authorized: hasRole,
      userId,
      roles,
    };
  } catch (error) {
    logger.error({ error, requiredRole }, 'Authorization check failed with exception');
    return {
      authorized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

'use server';

import { getCurrentSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  getV3OrganizationsByOrganizationIdMembersByUserIdRoles,
  getV3UsersMe,
} from '@/lib/eventuras-sdk';
import { oauthConfig } from '@/utils/oauthConfig';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({ namespace: 'web:admin', context: { module: 'checkAuthorization' } });

// Mirrors IsSystemAdmin() in the C# backend.
// SystemAdmin has global access regardless of organization membership.
const SYSTEM_ADMIN_ROLE = 'SystemAdmin';

/**
 * Returns true if the provided session roles include the system-wide admin role.
 * Pass `session?.user?.roles` from an already-fetched session to avoid redundant
 * network calls. For a standalone check, fetch the session yourself:
 *   const session = await getCurrentSession(oauthConfig);
 *   if (isSystemAdmin(session?.user?.roles ?? [])) { ... }
 */
export async function isSystemAdmin(sessionRoles: string[]): Promise<boolean> {
  return sessionRoles.includes(SYSTEM_ADMIN_ROLE);
}

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

    // SystemAdmin has global access – no org membership needed.
    // Fetch session once here so it can be reused and we avoid double calls.
    const session = await getCurrentSession(oauthConfig);
    const sessionRoles = session?.user?.roles ?? [];

    if (await isSystemAdmin(sessionRoles)) {
      logger.info(
        { userId, sessionRoles },
        'SystemAdmin detected, granting access without org check'
      );
      return { authorized: true, userId, roles: sessionRoles };
    }

    // Only resolve org ID now — getOrganizationId() may throw on a fresh install
    // with no organisations configured, so it must not run for SystemAdmins.
    const ORGANIZATION_ID = getOrganizationId();

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

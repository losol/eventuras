'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/apiClient';
import {
  postV3OrganizationsByOrganizationIdMembersByUserIdRoles,
  putV3OrganizationsByOrganizationIdMembersByUserId,
} from '@eventuras/event-sdk';
import { Logger } from '@eventuras/utils/src/Logger';

export async function addMember(orgId: number, userId: string) {
  const logContext = {
    namespace: 'organizations:addmember',
    orgId,
    userId,
  };

  try {
    Logger.info(logContext, `Starting to add user ${userId} as member to organization ${orgId}`, {
      organizationId: orgId,
      userId: userId,
      role: 'member',
    });

    const client = await createClient();
    await putV3OrganizationsByOrganizationIdMembersByUserId({
      headers: {
        'Eventuras-Org-Id': orgId,
      },
      path: {
        organizationId: orgId,
        userId,
      },
      client,
    });
  } catch (error) {
    Logger.error(
      logContext,
      `Failed to add user ${userId} to organization ${orgId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        organizationId: orgId,
        userId: userId,
      }
    );

    // Re-throw the error so the client can handle it
    throw error;
  }
}

export async function updateMemberRoles(orgId: number, userId: string, roles: string) {
  const logContext = {
    namespace: 'organizations',
    orgId,
    userId,
  };

  try {
    Logger.info(logContext, `Starting to add user ${userId} as admin to organization ${orgId}`, {
      organizationId: orgId,
      userId: userId,
      roles: roles,
    });

    const client = await createClient();

    const apiPayload = {
      body: { role: roles },
      headers: {
        'Eventuras-Org-Id': orgId,
      },
      path: {
        organizationId: orgId,
        userId: userId,
      },
      client,
    };

    // Actually call the API to add the member
    const result = await postV3OrganizationsByOrganizationIdMembersByUserIdRoles(apiPayload);
    Logger.info(logContext, result.response);

    Logger.debug(logContext, `Revalidating path for organization ${orgId}`, {
      path: `/admin/organizations/${orgId}`,
    });

    // revalidate the path
    revalidatePath(`/admin/organizations/${orgId}`);

    return { success: true };
  } catch (error) {
    Logger.error(
      logContext,
      `Failed to add user ${userId} to organization ${orgId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        organizationId: orgId,
        userId: userId,
      }
    );

    // Re-throw the error so the client can handle it
    throw error;
  }
}

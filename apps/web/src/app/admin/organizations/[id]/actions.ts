'use server';

import { revalidatePath } from 'next/cache';
import {
  postV3OrganizationsByOrganizationIdMembersByUserIdRoles,
  deleteV3OrganizationsByOrganizationIdMembersByUserIdRoles,
  putV3OrganizationsByOrganizationIdMembersByUserId
} from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

export async function addMember(orgId: number, userId: string) {
  const logContext = {
    namespace: 'organizations:addmember',
    orgId,
    userId
  };

  try {
    Logger.info(logContext, `Starting to add user ${userId} as member to organization ${orgId}`, {
      organizationId: orgId,
      userId: userId,
      role: 'member'
    });    await putV3OrganizationsByOrganizationIdMembersByUserId({
      headers: {
        'Eventuras-Org-Id': orgId
      },
      path: {
        organizationId: orgId,
        userId
      }
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
                stack: error.stack
              }
            : error,
        organizationId: orgId,
        userId: userId
      }
    );

    // Re-throw the error so the client can handle it
    throw error;
  }
}

export async function setAdmin(orgId: number, userId: string, makeAdmin: boolean) {
  const logContext = {
    namespace: 'organizations:set-admin',
    orgId,
    userId,
    makeAdmin
  };

  try {    const common = {
      headers: { 'Eventuras-Org-Id': orgId },
      path: { organizationId: orgId, userId }
    } as const;

    if (makeAdmin) {
      Logger.info(logContext, `Granting Admin to ${userId} in org ${orgId}`);
      await postV3OrganizationsByOrganizationIdMembersByUserIdRoles({
        ...common,
        body: { role: 'Admin' }
      });
    } else {
      Logger.info(logContext, `Revoking Admin from ${userId} in org ${orgId}`);
      await deleteV3OrganizationsByOrganizationIdMembersByUserIdRoles({
        ...common,
        body: { role: 'Admin' }
      });
    }

    revalidatePath(`/admin/organizations/${orgId}`);
    return { success: true };
  } catch (error) {
    Logger.error(
      logContext,
      `Failed to ${makeAdmin ? 'grant' : 'revoke'} Admin: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
        organizationId: orgId,
        userId
      }
    );
    throw error;
  }
}

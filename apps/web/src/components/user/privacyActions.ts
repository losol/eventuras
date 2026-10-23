'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import { DecisionValue, MyPurposeDto, putV3UserprofilePurposesByCode } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:user:privacy',
  context: { module: 'privacyActions' },
});

/**
 * Records the signed-in user's decision on one processing purpose in the current
 * organization. `allowed` false on a reservation is reserving oneself against it.
 */
export async function setPurposeDecision(
  code: string,
  allowed: boolean
): Promise<ServerActionResult<MyPurposeDto>> {
  const response = await putV3UserprofilePurposesByCode({
    client,
    headers: { 'Eventuras-Org-Id': getOrganizationId() },
    path: { code },
    body: { decision: allowed ? DecisionValue.ALLOWED : DecisionValue.DENIED },
  });

  if (!response.data) {
    logger.error({ code, error: response.error }, 'Failed to record purpose decision');
    return actionError('Could not save your choice');
  }

  return actionSuccess(response.data);
}

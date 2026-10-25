'use server';

import { formatApiError } from '@eventuras/core/errors';
import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { readCorrelationIdFromResponse } from '@/lib/correlation-id';
import {
  postV3ProcessingPurposes,
  type ProcessingPurposeDto,
  PurposeKind,
} from '@/lib/eventuras-sdk';
import { isCurrentUserSystemAdmin } from '@/utils/auth/checkAuthorization';
import { getSentryUserId } from '@/utils/auth/getSentryUserId';
import { getAccessToken } from '@/utils/getAccesstoken';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:system',
  context: { module: 'actions' },
});

export async function triggerWebServerError(): Promise<never> {
  if (!(await isCurrentUserSystemAdmin())) {
    logger.warn('Unauthorized call to triggerWebServerError');
    throw new Error('Forbidden');
  }

  logger.warn(
    { userId: await getSentryUserId() },
    'Intentional server-side error fired from admin diagnostics'
  );
  throw new Error('Sentry diagnostics: intentional web server error');
}

export async function triggerErrorTest(): Promise<ServerActionResult<{ status: number }>> {
  if (!(await isCurrentUserSystemAdmin())) {
    logger.warn('Unauthorized call to triggerErrorTest');
    return actionError('Forbidden');
  }

  const baseUrl = appConfig.env.BACKEND_URL as string;
  const token = await getAccessToken();

  if (!token) {
    return actionError('Not authenticated');
  }

  try {
    const response = await fetch(`${baseUrl}/v3/diagnostics/error-test`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // We expect a 500 from the error test endpoint.
    // Non-5xx errors (401/403/404) indicate a real problem.
    if (!response.ok && (response.status < 500 || response.status >= 600)) {
      logger.warn({ status: response.status }, 'Unexpected status from error test');
      return actionError(`Unexpected response: ${response.status}`);
    }

    logger.info(
      { status: response.status, userId: await getSentryUserId() },
      'Error test triggered'
    );
    return actionSuccess({ status: response.status });
  } catch (error) {
    logger.error({ error }, 'Failed to trigger error test');
    return actionError('Failed to reach API');
  }
}

export interface CreateProcessingPurposeInput {
  code: string;
  name: string;
  text: string;
  kind: PurposeKind;
  hasSpecialCategoryData: boolean;
}

/** Create a processing purpose in the current organization. Requires SystemAdmin on the API. */
export async function createProcessingPurpose(
  input: CreateProcessingPurposeInput
): Promise<ServerActionResult<ProcessingPurposeDto>> {
  if (!(await isCurrentUserSystemAdmin())) {
    logger.warn('Unauthorized call to createProcessingPurpose');
    return actionError('Forbidden');
  }

  try {
    const response = await postV3ProcessingPurposes({
      headers: { 'Eventuras-Org-Id': getOrganizationId() },
      body: {
        code: input.code.trim(),
        name: input.name.trim(),
        text: input.text.trim(),
        kind: input.kind,
        hasSpecialCategoryData: input.hasSpecialCategoryData,
      },
    });

    if (!response.data) {
      logger.error(
        { code: input.code, error: response.error },
        'Failed to create processing purpose'
      );
      return actionError(
        formatApiError(
          response.error,
          'Failed to create processing purpose',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    logger.info({ code: response.data.code }, 'Processing purpose created');
    return actionSuccess(response.data);
  } catch (error) {
    logger.error({ code: input.code, error }, 'Failed to create processing purpose');
    return actionError('Failed to create processing purpose');
  }
}

'use server';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

const logger = Logger.create({
  namespace: 'web:system',
  context: { module: 'actions' },
});

export async function triggerErrorTest(): Promise<ServerActionResult<{ status: number }>> {
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

    logger.info({ status: response.status }, 'Error test triggered');
    return actionSuccess({ status: response.status });
  } catch (error) {
    logger.error({ error }, 'Failed to trigger error test');
    return actionError('Failed to reach API');
  }
}

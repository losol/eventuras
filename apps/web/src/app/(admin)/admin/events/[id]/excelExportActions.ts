'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { publicEnv } from '@/config.client';
import { getAccessToken } from '@/utils/getAccesstoken';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { module: 'excelExportActions' },
});

/**
 * Server action to download registrations as Excel file
 * @param eventId - The event ID to download registrations for
 * @returns Excel file as base64-encoded string or error
 */
export async function downloadRegistrationsExcel(
  eventId: number
): Promise<ServerActionResult<string>> {
  try {
    logger.info({ eventId }, 'Downloading registrations Excel file');

    const token = await getAccessToken();

    if (!token) {
      logger.error({ eventId }, 'No access token available for Excel export');
      return actionError('Authentication required');
    }

    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_BACKEND_URL}/v3/registrations?EventId=${eventId}`,
      {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      logger.error(
        {
          eventId,
          status: response.status,
          statusText: response.statusText,
        },
        'Failed to download Excel file'
      );
      return actionError(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      logger.error({ eventId }, 'Received empty Excel file');
      return actionError('Received empty file');
    }

    // Convert blob to base64 for transmission to client
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    logger.info({ eventId, fileSize: blob.size }, 'Excel file downloaded successfully');

    return actionSuccess(base64);
  } catch (error) {
    logger.error({ error, eventId }, 'Error downloading Excel file');
    return actionError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

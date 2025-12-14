'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { publicEnv } from '@/config.client';
import { getAccessToken } from '@/utils/getAccesstoken';

const logger = Logger.create({
  namespace: 'web:admin:certificates',
  context: { module: 'certificateActions' },
});

/**
 * Server action to download a certificate as PDF
 * @param certificateId - The certificate ID to download
 * @returns PDF file as base64-encoded string or error
 */
export async function downloadCertificatePdf(
  certificateId: number
): Promise<ServerActionResult<string>> {
  try {
    logger.info({ certificateId }, 'Downloading certificate PDF');

    const token = await getAccessToken();

    if (!token) {
      logger.error({ certificateId }, 'No access token available for certificate download');
      return actionError('Authentication required');
    }

    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_BACKEND_URL}/v3/certificates/${certificateId}?format=Pdf`,
      {
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      logger.error(
        {
          certificateId,
          status: response.status,
          statusText: response.statusText,
        },
        'Failed to download certificate PDF'
      );
      return actionError(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      logger.error({ certificateId }, 'Received empty PDF file');
      return actionError('Received empty file');
    }

    // Convert blob to base64 for transmission to client
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    logger.info({ certificateId, fileSize: blob.size }, 'Certificate PDF downloaded successfully');

    return actionSuccess(base64);
  } catch (error) {
    logger.error({ error, certificateId }, 'Error downloading certificate PDF');
    return actionError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Server action to send a certificate to the participant via email
 * @param registrationId - The registration ID to send certificate for
 * @returns Success or error
 */
export async function sendCertificateToParticipant(
  registrationId: number
): Promise<ServerActionResult<void>> {
  try {
    logger.info({ registrationId }, 'Sending certificate to participant');

    const token = await getAccessToken();

    if (!token) {
      logger.error({ registrationId }, 'No access token available for sending certificate');
      return actionError('Authentication required');
    }

    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_BACKEND_URL}/v3/registrations/${registrationId}/certificate/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      logger.error(
        {
          registrationId,
          status: response.status,
          statusText: response.statusText,
        },
        'Failed to send certificate'
      );
      return actionError(`Failed to send: ${response.status} ${response.statusText}`);
    }

    logger.info({ registrationId }, 'Certificate sent successfully');

    return actionSuccess(undefined);
  } catch (error) {
    logger.error({ error, registrationId }, 'Error sending certificate');
    return actionError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

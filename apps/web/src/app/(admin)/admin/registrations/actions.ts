'use server';

import { revalidatePath } from 'next/cache';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  getV3Registrations,
  patchV3RegistrationsById,
  postV3RegistrationsByIdCertificateSend,
  putV3RegistrationsById,
  RegistrationDto,
  RegistrationDtoPageResponseDto,
  RegistrationStatus,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:admin:registrations',
  context: { module: 'actions' },
});

export default async function revalidateRegistrationCache() {
  logger.info('Revalidating registration cache');
  revalidatePath('/admin/registrations');
}

export async function getRegistrations(page: number = 1, pageSize: number = 50) {
  try {
    const organizationId = getOrganizationId();

    const { data, error } = await getV3Registrations({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      query: {
        IncludeUserInfo: true,
        IncludeEventInfo: true,
        Page: page,
        Count: pageSize,
        Ordering: ['registrationId:desc'],
      },
    });

    if (error) {
      console.error('Failed to fetch registrations:', error);
      return {
        ok: false as const,
        error: String(error),
        data: null,
      };
    }

    // The data is already typed as RegistrationDtoPageResponseDto
    return {
      ok: true as const,
      data: data as RegistrationDtoPageResponseDto,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Update registration data
 */
export async function updateRegistration(
  id: number,
  updatedRegistration: Partial<RegistrationDto>
): Promise<ServerActionResult<RegistrationDto>> {
  const orgId = getOrganizationId();

  logger.info({ registrationId: id }, 'Updating registration');

  try {
    const response = await putV3RegistrationsById({
      client,
      path: { id },
      headers: { 'Eventuras-Org-Id': orgId },
      body: updatedRegistration,
    });

    if (!response.data) {
      logger.error({ error: response.error, registrationId: id }, 'Failed to update registration');
      return actionError('Failed to update registration');
    }

    logger.info({ registrationId: id }, 'Registration updated successfully');
    revalidatePath('/admin/registrations');
    return actionSuccess(response.data, 'Registration updated successfully');
  } catch (error) {
    logger.error({ error, registrationId: id }, 'Unexpected error updating registration');
    return actionError('An unexpected error occurred');
  }
}

/**
 * Update registration status using PATCH endpoint
 */
export async function updateRegistrationStatus(
  registrationId: number,
  status: RegistrationStatus
): Promise<ServerActionResult<RegistrationDto>> {
  const orgId = getOrganizationId();

  logger.info({ registrationId, status }, 'Updating registration status via PATCH');

  try {
    const response = await patchV3RegistrationsById({
      client,
      path: { id: registrationId },
      headers: { 'Eventuras-Org-Id': orgId },
      body: { status },
    });

    if (!response.data) {
      logger.error(
        { error: response.error, registrationId, status },
        'Failed to update registration status'
      );
      return actionError('Failed to update registration status');
    }

    logger.info({ registrationId, status }, 'Registration status updated successfully');
    revalidatePath('/admin/registrations');
    return actionSuccess(response.data, 'Status updated successfully!');
  } catch (error) {
    logger.error(
      { error, registrationId, status },
      'Unexpected error updating registration status'
    );
    return actionError('An unexpected error occurred');
  }
}

/**
 * Send certificate email for a registration
 */
export async function sendCertificateEmail(
  registrationId: number
): Promise<ServerActionResult<void>> {
  const orgId = getOrganizationId();

  logger.info({ registrationId }, 'Sending certificate email');

  try {
    const response = await postV3RegistrationsByIdCertificateSend({
      client,
      path: { id: registrationId },
      headers: { 'Eventuras-Org-Id': orgId },
    });

    if (!response.data) {
      logger.error({ error: response.error, registrationId }, 'Failed to send certificate email');
      return actionError('Failed to send certificate email');
    }

    logger.info({ registrationId }, 'Certificate email sent successfully');
    revalidatePath('/admin/registrations');
    return actionSuccess(undefined, 'Certificate sent successfully!');
  } catch (error) {
    logger.error({ error, registrationId }, 'Unexpected error sending certificate email');
    return actionError('An unexpected error occurred');
  }
}

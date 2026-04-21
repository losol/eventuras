'use server';

import { revalidatePath } from 'next/cache';

import { formatApiError } from '@eventuras/core/errors';
import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { readCorrelationIdFromResponse } from '@/lib/correlation-id';
import { client } from '@/lib/eventuras-client';
import {
  getV3Registrations,
  getV3RegistrationsById,
  PageResponseDtoOfRegistrationDto,
  patchV3RegistrationsById,
  postV3RegistrationsByIdCertificateSend,
  putV3RegistrationsById,
  RegistrationDto,
  RegistrationPatchDto,
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
  let organizationId: number | undefined;

  try {
    organizationId = getOrganizationId();

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
      logger.error(
        {
          error,
          organizationId,
          page,
          pageSize,
        },
        'Failed to fetch registrations'
      );
      return {
        ok: false as const,
        error: String(error),
        data: null,
      };
    }

    // The data is already typed as PageResponseDtoOfRegistrationDto
    return {
      ok: true as const,
      data: data as PageResponseDtoOfRegistrationDto,
      error: null,
    };
  } catch (error) {
    logger.error(
      {
        error,
        organizationId,
        page,
        pageSize,
      },
      'Unexpected error fetching registrations'
    );
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function getRegistrationDetail(
  registrationId: number
): Promise<ServerActionResult<RegistrationDto>> {
  logger.info({ registrationId }, 'Fetching registration detail');

  try {
    const orgId = getOrganizationId();
    const response = await getV3RegistrationsById({
      client,
      path: { id: registrationId },
      headers: { 'Eventuras-Org-Id': orgId },
      query: {
        IncludeEventInfo: true,
        IncludeProducts: true,
        IncludeUserInfo: true,
        IncludeOrders: true,
      },
    });

    if (!response.data) {
      logger.error(
        { error: response.error, registrationId },
        'Failed to fetch registration detail'
      );
      return actionError(
        formatApiError(
          response.error,
          'Failed to load registration',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    return actionSuccess(response.data);
  } catch (error) {
    logger.error({ error, registrationId }, 'Unexpected error fetching registration detail');
    return actionError('An unexpected error occurred');
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
      return actionError(
        formatApiError(
          response.error,
          'Failed to update registration',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
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
 * Apply a partial update to a registration via PATCH.
 *
 * Accepts any subset of the {@link RegistrationPatchDto} shape. Fields set
 * to `null` on nullable string properties clear the stored value; omitted
 * fields are left untouched (JSON Merge Patch semantics, enforced by the
 * API).
 */
export async function patchRegistration(
  registrationId: number,
  patch: RegistrationPatchDto
): Promise<ServerActionResult<RegistrationDto>> {
  logger.info({ registrationId, fields: Object.keys(patch) }, 'Patching registration');

  try {
    const orgId = getOrganizationId();
    const response = await patchV3RegistrationsById({
      client,
      path: { id: registrationId },
      headers: { 'Eventuras-Org-Id': orgId },
      body: patch,
    });

    if (!response.data) {
      logger.error({ error: response.error, registrationId }, 'Failed to patch registration');
      return actionError(
        formatApiError(
          response.error,
          'Failed to update registration',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    logger.info({ registrationId }, 'Registration patched successfully');
    revalidatePath('/admin/registrations');
    revalidatePath(`/admin/registrations/${registrationId}`);
    if (response.data.eventId) {
      revalidatePath(`/admin/events/${response.data.eventId}`);
    }
    return actionSuccess(response.data, 'Registration updated successfully!');
  } catch (error) {
    logger.error({ error, registrationId }, 'Unexpected error patching registration');
    return actionError('An unexpected error occurred');
  }
}

/**
 * Narrow helper: update only the registration status.
 * Kept for existing callers (e.g. inline select in EventParticipantList).
 */
export async function updateRegistrationStatus(
  registrationId: number,
  status: RegistrationStatus
): Promise<ServerActionResult<RegistrationDto>> {
  return patchRegistration(registrationId, { status });
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

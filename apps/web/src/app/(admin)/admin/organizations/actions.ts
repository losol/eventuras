'use server';

import { revalidatePath } from 'next/cache';

import { formatApiError } from '@eventuras/core/errors';
import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { readCorrelationIdFromResponse } from '@/lib/correlation-id';
import { postV3Organizations } from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:admin:organizations',
  context: { action: 'createOrganization' },
});

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  url?: string;
  email?: string;
  phone?: string;
}

/** Create a new organization. Requires SystemAdmin on the API. */
export async function createOrganization(
  input: CreateOrganizationInput
): Promise<ServerActionResult<{ organizationId: number }>> {
  if (!input.name?.trim()) {
    return actionError('Organization name is required');
  }

  try {
    const response = await postV3Organizations({
      body: {
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        url: input.url?.trim() || undefined,
        email: input.email?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
      },
    });

    if (!response.data?.organizationId) {
      logger.error({ error: response.error }, 'Failed to create organization');
      return actionError(
        formatApiError(
          response.error,
          'Failed to create organization',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    logger.info({ organizationId: response.data.organizationId }, 'Organization created');
    revalidatePath('/admin/organizations');

    return actionSuccess({ organizationId: response.data.organizationId });
  } catch (error) {
    logger.error({ error }, 'Error creating organization');
    return actionError('An unexpected error occurred while creating the organization');
  }
}

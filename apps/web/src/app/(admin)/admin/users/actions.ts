'use server';

import { revalidatePath } from 'next/cache';

import { formatApiError } from '@eventuras/core/errors';
import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { readCorrelationIdFromResponse } from '@/lib/correlation-id';
import { client } from '@/lib/eventuras-client';
import {
  getV3Users,
  PageResponseDtoOfUserDto,
  postV3Users,
  putV3Userprofile,
  putV3UsersById,
  UserDto,
  UserFormDto,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:users',
  context: { module: 'actions' },
});

export async function getUsers(page: number = 1, pageSize: number = 50) {
  let organizationId: number | undefined;

  try {
    organizationId = getOrganizationId();

    const { data, error } = await getV3Users({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      query: {
        Page: page,
        Count: pageSize,
      },
    });

    if (error) {
      logger.error({ error, organizationId, page, pageSize }, 'Failed to fetch users');
      return {
        ok: false as const,
        error: String(error),
        data: null,
      };
    }

    return {
      ok: true as const,
      data: data as PageResponseDtoOfUserDto,
      error: null,
    };
  } catch (error) {
    logger.error({ error, organizationId, page, pageSize }, 'Unexpected error fetching users');
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function createUser(userData: UserFormDto): Promise<ServerActionResult<UserDto>> {
  logger.info('Creating new user');

  try {
    const response = await postV3Users({
      client,
      body: userData,
    });

    if (!response.data) {
      logger.error({ error: response.error }, 'Failed to create user');
      return actionError(
        formatApiError(
          response.error,
          'Failed to create user',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    logger.info({ userId: response.data.id }, 'User created successfully');
    revalidatePath('/admin/users');
    return actionSuccess(response.data, 'User created successfully!');
  } catch (error) {
    logger.error({ error }, 'Unexpected error creating user');
    return actionError('An unexpected error occurred');
  }
}

export async function updateUser(
  userId: string,
  userData: UserFormDto
): Promise<ServerActionResult<UserDto>> {
  logger.info({ userId }, 'Updating user');

  try {
    const response = await putV3UsersById({
      client,
      path: { id: userId },
      body: userData,
    });

    if (!response.data) {
      logger.error({ error: response.error, userId }, 'Failed to update user');
      return actionError(
        formatApiError(
          response.error,
          'Failed to update user',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    logger.info({ userId }, 'User updated successfully');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return actionSuccess(response.data, 'User updated successfully!');
  } catch (error) {
    logger.error({ error, userId }, 'Unexpected error updating user');
    return actionError('An unexpected error occurred');
  }
}

export async function updateUserProfile(
  userData: UserFormDto
): Promise<ServerActionResult<UserDto>> {
  const baseUrl = appConfig.env.BACKEND_URL as string;
  const clientConfig = client.getConfig();

  logger.info(
    {
      backendUrl: baseUrl,
      endpoint: '/v3/userprofile',
      fullUrl: baseUrl ? `${baseUrl}/v3/userprofile` : 'undefined',
      clientBaseUrl: clientConfig.baseUrl,
      nodeVersion: process.version,
      platform: process.platform,
    },
    'Updating user profile'
  );

  try {
    const response = await putV3Userprofile({
      client,
      body: userData,
    });

    if (!response.data) {
      logger.error({ error: response.error }, 'Failed to update user profile');
      return actionError(
        formatApiError(
          response.error,
          'Failed to update your profile',
          response.response?.status,
          response.response ? readCorrelationIdFromResponse(response.response) : undefined
        )
      );
    }

    logger.info({ userId: response.data.id }, 'User profile updated successfully');
    revalidatePath('/user/profile');
    return actionSuccess(response.data, 'Profile updated successfully!');
  } catch (error) {
    const err = error as {
      cause?: {
        code?: string;
        message?: string;
        errno?: number;
        syscall?: string;
        address?: string;
        port?: number;
      };
      code?: string;
      message?: string;
    };

    logger.error(
      {
        error,
        backendUrl: baseUrl,
        endpoint: '/v3/userprofile',
        fullUrl: baseUrl ? `${baseUrl}/v3/userprofile` : 'undefined',
        errorCode: err?.cause?.code || err?.code,
        errorMessage: err?.message,
        syscall: err?.cause?.syscall,
        address: err?.cause?.address,
        port: err?.cause?.port,
        errno: err?.cause?.errno,
      },
      'Unexpected error updating user profile'
    );
    return actionError('An unexpected error occurred');
  }
}

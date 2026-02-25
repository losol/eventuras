'use server';

import { revalidatePath } from 'next/cache';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { client } from '@/lib/eventuras-client';
import {
  postV3Users,
  putV3Userprofile,
  putV3UsersById,
  UserDto,
  UserFormDto,
} from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:users',
  context: { module: 'actions' },
});

/**
 * Create a new user
 */
export async function createUser(userData: UserFormDto): Promise<ServerActionResult<UserDto>> {
  logger.info('Creating new user');

  try {
    const response = await postV3Users({
      client,
      body: userData,
    });

    if (!response.data) {
      logger.error({ error: response.error }, 'Failed to create user');
      return actionError('Failed to create user');
    }

    logger.info({ userId: response.data.id }, 'User created successfully');
    revalidatePath('/admin/users');
    return actionSuccess(response.data, 'User created successfully!');
  } catch (error) {
    logger.error({ error }, 'Unexpected error creating user');
    return actionError('An unexpected error occurred');
  }
}

/**
 * Update an existing user (admin endpoint)
 */
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
      return actionError('Failed to update user');
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

/**
 * Update the current user's profile
 */
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
      return actionError('Failed to update your profile');
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

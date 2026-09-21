'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  getV3Orders,
  getV3Registrations,
  getV3UsersById,
  OrderDto,
  RegistrationDto,
  UserDto,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:admin:users',
  context: { module: 'userActions' },
});

/** A section that failed to load is null, so the drawer can say so without hiding the rest. */
export interface UserOverview {
  user: UserDto;
  registrations: { items: RegistrationDto[]; total: number } | null;
  orders: { items: OrderDto[]; total: number } | null;
}

/** Newest first; the drawer is a summary, and the full lists are a click away. */
const OVERVIEW_LIMIT = 50;

/**
 * Everything the admin user drawer shows about one person: their profile, and their
 * registrations and orders in the current organization.
 */
export async function getUserOverview(userId: string): Promise<ServerActionResult<UserOverview>> {
  const organizationId = getOrganizationId();
  const orgHeader = { 'Eventuras-Org-Id': organizationId };

  try {
    const [user, registrations, orders] = await Promise.all([
      getV3UsersById({ client, path: { id: userId } }),
      getV3Registrations({
        client,
        headers: orgHeader,
        query: {
          UserId: userId,
          IncludeEventInfo: true,
          Count: OVERVIEW_LIMIT,
          Ordering: ['registrationId:desc'],
        },
      }),
      getV3Orders({
        client,
        headers: orgHeader,
        query: {
          UserId: userId,
          OrganizationId: organizationId,
          Count: OVERVIEW_LIMIT,
          Ordering: ['time:desc'],
        },
      }),
    ]);

    if (!user.data) {
      logger.error({ userId, error: user.error }, 'Failed to load user for overview');
      return actionError('Could not load the user');
    }
    if (registrations.error) {
      logger.warn(
        { userId, error: registrations.error },
        'Failed to load registrations for overview'
      );
    }
    if (orders.error) {
      logger.warn({ userId, error: orders.error }, 'Failed to load orders for overview');
    }

    // The orders endpoint returns a PageResponseDto<OrderDto> but declares no response
    // type, so the SDK types it `unknown`; the registrations endpoint is typed.
    const orderPage = orders.data as
      { data?: OrderDto[] | null; total?: number } | null | undefined;

    return actionSuccess({
      user: user.data,
      registrations: registrations.data
        ? { items: registrations.data.data ?? [], total: registrations.data.total ?? 0 }
        : null,
      orders: orderPage ? { items: orderPage.data ?? [], total: orderPage.total ?? 0 } : null,
    });
  } catch (error) {
    logger.error({ userId, error }, 'Unexpected error loading user overview');
    return actionError('An unexpected error occurred');
  }
}

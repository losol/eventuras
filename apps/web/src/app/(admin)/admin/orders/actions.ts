'use server';

import { revalidatePath } from 'next/cache';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { client } from '@/lib/eventuras-client';
import {
  getV3Orders,
  InvoiceRequestDto,
  OrderDto,
  patchV3OrdersById,
  postV3Invoices,
} from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:admin:orders',
  context: { module: 'actions' },
});

export interface GetOrdersResult {
  data: OrderDto[];
  pages: number;
  count: number;
}

export async function getOrders(page: number = 1, pageSize: number = 50) {
  try {
    const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;

    const { data, error } = await getV3Orders({
      client,
      headers: {
        'Eventuras-Org-Id':
          typeof organizationId === 'number'
            ? organizationId
            : Number.parseInt(organizationId as string, 10),
      },
      query: {
        OrganizationId:
          typeof organizationId === 'number'
            ? organizationId
            : Number.parseInt(organizationId as string, 10),
        IncludeUser: true,
        IncludeRegistration: true,
        Page: page,
        Count: pageSize,
        Ordering: ['time:desc'],
      },
    });

    if (error) {
      console.error('Failed to fetch orders:', error);
      return {
        ok: false as const,
        error: String(error),
        data: null,
      };
    }

    // Type assertion for the API response structure
    const responseData = data as unknown as GetOrdersResult;

    return {
      ok: true as const,
      data: responseData,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function verifyOrderAction(orderId: number) {
  logger.info({ orderId }, 'Verifying order...');

  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId =
    typeof organizationId === 'number'
      ? organizationId
      : Number.parseInt(organizationId as string, 10);

  if (!orgId || Number.isNaN(orgId)) {
    logger.error('Organization ID is required');
    throw new Error('Organization ID is required');
  }

  try {
    const response = await patchV3OrdersById({
      client,
      headers: {
        'Eventuras-Org-Id': orgId,
      },
      path: {
        id: orderId,
      },
      body: {
        status: 'Verified',
      },
    });

    if (response.error) {
      logger.error({ orderId, error: response.error }, 'Failed to verify order');
      throw new Error('Failed to verify order');
    }

    logger.info({ orderId }, 'Order verified successfully');
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    logger.error({ error, orderId }, 'Error verifying order');
    throw error;
  }
}

export async function invoiceOrderAction(orderId: number): Promise<ServerActionResult<void>> {
  logger.info({ orderId }, 'Creating invoice for order...');

  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId =
    typeof organizationId === 'number'
      ? organizationId
      : Number.parseInt(organizationId as string, 10);

  if (!orgId || Number.isNaN(orgId)) {
    logger.error('Organization ID is required');
    return actionError('Organization ID is required');
  }

  try {
    const invoiceRequest: InvoiceRequestDto = {
      orderIds: [orderId],
    };

    const response = await postV3Invoices({
      client,
      headers: { 'Eventuras-Org-Id': orgId },
      body: invoiceRequest,
    });

    if (response.data) {
      logger.info({ orderId }, 'Invoice sent to accounting system successfully');
      revalidatePath('/admin/orders');
      return actionSuccess(undefined, 'Invoice sent to accounting system');
    } else {
      logger.error({ orderId, error: response.error }, 'Failed to create invoice');

      // Extract error message from API response
      const errorMessage =
        typeof response.error === 'object' &&
        response.error &&
        'message' in response.error &&
        typeof response.error.message === 'string'
          ? response.error.message
          : 'Failed to create invoice';

      return actionError(errorMessage);
    }
  } catch (error) {
    logger.error({ error, orderId }, 'Error creating invoice');
    return actionError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

'use server';

import { revalidatePath } from 'next/cache';

import { formatApiError } from '@eventuras/core/errors';
import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  getV3Orders,
  InvoiceRequestDto,
  OrderDto,
  OrderPatchDto,
  patchV3OrdersById,
  postV3Invoices,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

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
  let organizationId: number | undefined;

  try {
    organizationId = getOrganizationId();

    const { data, error } = await getV3Orders({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      query: {
        OrganizationId: organizationId,
        IncludeUser: true,
        IncludeRegistration: true,
        Page: page,
        Count: pageSize,
        Ordering: ['time:desc'],
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
        'Failed to fetch orders'
      );
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
    logger.error(
      {
        error,
        organizationId,
        page,
        pageSize,
      },
      'Unexpected error fetching orders'
    );
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Apply a partial update to an order via PATCH. Callers can pass any subset
 * of the {@link OrderPatchDto} shape (status, comments, paymentMethod).
 */
export async function patchOrder(
  orderId: number,
  patch: OrderPatchDto
): Promise<ServerActionResult<OrderDto>> {
  logger.info({ orderId, fields: Object.keys(patch) }, 'Patching order');

  try {
    const orgId = getOrganizationId();
    const response = await patchV3OrdersById({
      client,
      headers: { 'Eventuras-Org-Id': orgId },
      path: { id: orderId },
      body: patch,
    });

    if (!response.data) {
      logger.error({ orderId, error: response.error }, 'Failed to patch order');
      return actionError(formatApiError(response.error, 'Failed to update order'));
    }

    logger.info({ orderId }, 'Order patched successfully');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    // Callers supply context-specific success toast text via `result.message ?? '...'`.
    return actionSuccess(response.data);
  } catch (error) {
    logger.error({ error, orderId }, 'Unexpected error patching order');
    return actionError('An unexpected error occurred');
  }
}

/**
 * Narrow helper: flip an order's status to Verified. Thin wrapper over
 * `patchOrder` so existing callers keep working and get the same
 * formatted-error + revalidate behaviour.
 */
export async function verifyOrderAction(orderId: number): Promise<ServerActionResult<OrderDto>> {
  return patchOrder(orderId, { status: 'Verified' });
}

export async function invoiceOrderAction(orderId: number): Promise<ServerActionResult<void>> {
  logger.info({ orderId }, 'Creating invoice for order...');

  const orgId = getOrganizationId();

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
    }

    logger.error({ orderId, error: response.error }, 'Failed to create invoice');
    return actionError(formatApiError(response.error, 'Failed to create invoice'));
  } catch (error) {
    logger.error({ error, orderId }, 'Error creating invoice');
    return actionError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

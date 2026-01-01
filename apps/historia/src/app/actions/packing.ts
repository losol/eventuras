'use server';

import config from '@payload-config';
import { getPayload } from 'payload';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { Order } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:packing',
  context: { module: 'packingActions' },
});

/**
 * Get all orders that need to be packed
 * Excludes completed and canceled orders, and orders that already have shipments
 */
export async function getPackingQueue(): Promise<ServerActionResult<Order[]>> {
  try {
    logger.info('Fetching packing queue');

    const payload = await getPayload({ config });

    // Get all shipments to exclude already shipped orders
    const shipments = await payload.find({
      collection: 'shipments',
      limit: 1000,
      depth: 0,
    });

    const shippedOrderIds = shipments.docs.map((s) =>
      typeof s.order === 'string' ? s.order : s.order.id
    );

    // Fetch orders that need packing
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          {
            status: {
              in: ['pending', 'processing', 'on-hold'],
            },
          },
          {
            id: {
              not_in: shippedOrderIds,
            },
          },
        ],
      },
      depth: 2,
      limit: 100,
      sort: 'createdAt',
    });

    logger.info({ count: orders.docs.length }, 'Found orders to pack');

    return actionSuccess(orders.docs);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch packing queue');
    return actionError(error instanceof Error ? error.message : 'Failed to fetch packing queue');
  }
}

/**
 * Mark order as ready to ship by creating a shipment
 */
export async function markOrderPacked(
  orderId: string
): Promise<ServerActionResult<{ shipmentId: string }>> {
  try {
    logger.info({ orderId }, 'Marking order as packed');

    const payload = await getPayload({ config });

    // Get the order with items
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
    });

    if (!order) {
      return actionError('Order not found');
    }

    // Extract tenant ID from order
    const tenantId = typeof order.tenant === 'string' ? order.tenant : order.tenant?.id;

    logger.info({ orderId, tenantId, orderTenant: order.tenant }, 'Creating shipment with tenant');

    // Create shipment items from order items
    const shipmentItems = order.items.map((item) => ({
      orderItemId: item.itemId,
      product: typeof item.product === 'string' ? item.product : item.product.id,
      quantity: item.quantity || 1,
    }));

    // Create the shipment with tenant from order
    const shipment = await payload.create({
      collection: 'shipments',
      data: {
        order: orderId,
        items: shipmentItems,
        shippingAddress: order.shippingAddress,
        status: 'ready-to-ship',
        shipmentType: 'full',
        // Copy tenant from order for multi-tenant support
        tenant: tenantId,
      },
    });

    logger.info({ orderId, shipmentId: shipment.id }, 'Order marked as packed');

    return actionSuccess(
      { shipmentId: shipment.id },
      'Order marked as ready to ship'
    );
  } catch (error) {
    logger.error({ error, orderId }, 'Failed to mark order as packed');
    return actionError(
      error instanceof Error ? error.message : 'Failed to mark order as packed'
    );
  }
}

'use server';

import config from '@payload-config';
import { headers } from 'next/headers';
import { getPayload, Where } from 'payload';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { User } from '@/payload-types';

import {
  calculateProductSummary,
  calculateTransactionSummary,
  enrichOrdersWithTransactionSummary,
  type OrderWithTransactions,
  type ProductSummaryLine,
  type TransactionSummary,
} from '@/lib/reports/salesReportHelpers';

const logger = Logger.create({
  namespace: 'historia:sales-report',
  context: { module: 'salesReportActions' },
});

export interface SalesReportData {
  dateRange: { startDate: string; endDate: string };
  productSummary: ProductSummaryLine[];
  transactionSummary: TransactionSummary;
  orders: OrderWithTransactions[];
  currency: string;
  tenantName?: string;
}

export interface SalesReportParams {
  startDate: string;
  endDate: string;
  tenantId?: string;
}

export async function getSalesReport(
  params: SalesReportParams
): Promise<ServerActionResult<SalesReportData>> {
  try {
    const payload = await getPayload({ config });

    // Verify user has admin access
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (!user || !('email' in user)) {
      return actionError('Unauthorized');
    }

    const payloadUser = user as User;
    const isAdmin = payloadUser.roles?.includes('system-admin');
    if (!isAdmin) {
      return actionError('Forbidden - Admin access required');
    }

    logger.info({ params, userId: payloadUser.id }, 'Generating sales report');

    const where: Where = {
      and: [
        { createdAt: { greater_than_equal: params.startDate } },
        { createdAt: { less_than_equal: params.endDate } },
        { status: { not_equals: 'canceled' } },
        ...(params.tenantId ? [{ tenant: { equals: params.tenantId } }] : []),
      ],
    };

    const orders = await payload.find({
      collection: 'orders',
      where,
      depth: 2,
      limit: 0,
      sort: '-createdAt',
    });

    logger.info({ count: orders.docs.length }, 'Found orders for report');

    const productSummary = calculateProductSummary(orders.docs);
    const transactionSummary = calculateTransactionSummary(orders.docs);
    const ordersWithTransactions = enrichOrdersWithTransactionSummary(orders.docs);

    // Get tenant name from first order with a populated tenant
    let tenantName: string | undefined;
    for (const order of orders.docs) {
      if (order.tenant && typeof order.tenant === 'object' && 'name' in order.tenant) {
        tenantName = order.tenant.name;
        break;
      }
    }

    return actionSuccess({
      dateRange: { startDate: params.startDate, endDate: params.endDate },
      productSummary,
      transactionSummary,
      orders: ordersWithTransactions,
      // NOK is currently the only supported currency for Historia sales reports
      currency: 'NOK',
      tenantName,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate sales report');
    return actionError(error instanceof Error ? error.message : 'Failed to generate sales report');
  }
}

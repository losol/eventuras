'use client';
import {
  InvoiceRequestDto,
  OrderDto,
  OrderStatus,
  PaymentProvider,
  postV3Invoices,
} from '@eventuras/event-sdk';
import { Button, Definition, DescriptionList, Drawer, Heading, Term } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'web:admin:orders',
  context: { component: 'OrderActionsMenu' },
});

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { createClient } from '@/utils/apiClient';
import { publicEnv } from '@/config.client';

export type OrderActionsMenuProps = {
  order: OrderDto;
};

export const OrderActionsMenu = ({ order }: OrderActionsMenuProps) => {
  const t = useTranslations();
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);
  const router = useRouter();
  logger.info({ order: order, registration: order.registration }, 'Order details');

  const invoicablePaymentMethods: PaymentProvider[] = [
    'PowerOfficeEmailInvoice',
    'PowerOfficeEHFInvoice',
  ];

  const isOrderVerified = order.status === 'Verified';
  const hasInvoicablePaymentMethod =
    order.paymentMethod != null && invoicablePaymentMethods.includes(order.paymentMethod);

  const shouldShowInvoiceButton = isOrderVerified && hasInvoicablePaymentMethod;

  const verifyOrder =
    ({ order }: { order: OrderDto }) =>
    async () => {
      if (!order.orderId) {
        throw new Error('Order ID is required');
      }
      const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
      if (!orgId || isNaN(orgId)) {
        throw new Error('Organization ID is required');
      }

      await fetch(`${publicEnv.NEXT_PUBLIC_API_BASE_URL as string}/v3/orders/${order.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json-patch+json',
          'Eventuras-Org-Id': orgId.toString(),
        },
        body: JSON.stringify([
          {
            op: 'replace',
            path: '/status',
            value: 'Verified',
          },
        ]),
      });
      router.refresh();
    };

  const invoiceOrder = async (order: OrderDto) => {
    if (!order.orderId) {
      throw new Error('Order ID is required');
    }

    const client = await createClient();
    const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
    if (!orgId || isNaN(orgId)) {
      throw new Error('Organization ID is required');
    }

    const invoiceRequest: InvoiceRequestDto = {
      orderIds: [order.orderId],
    };

    const response = await postV3Invoices({
      headers: { 'Eventuras-Org-Id': orgId },
      body: invoiceRequest,
      client,
    });

    if (response.data) {
      logger.info('Invoice sent to accounting system');
    }
    router.refresh();
  };

  return (
    <>
      {order.status === 'Draft' && (
        <Button variant="primary" onClick={verifyOrder({ order })}>
          Verify
        </Button>
      )}
      {order.status !== 'Draft' && (
        <Button variant="primary" onClick={() => setInvoiceDrawerOpen(!invoiceDrawerOpen)}>
          {t('admin.labels.invoice')}
        </Button>
      )}

      <Drawer
        isOpen={invoiceDrawerOpen}
        onSave={() => setInvoiceDrawerOpen(false)}
        onCancel={() => setInvoiceDrawerOpen(false)}
      >
        <Heading as="h2">Invoice</Heading>
        <div>
          <DescriptionList>
            <Term>Order</Term>
            <Definition>{order.orderId}</Definition>
            <Term>PaymentMethod</Term>
            <Definition>{order.paymentMethod}</Definition>
            <Term>Log</Term>
            <Definition>{order.log}</Definition>
          </DescriptionList>
        </div>
        {shouldShowInvoiceButton && (
          <Button onClick={() => invoiceOrder(order)}>
            Send to accounting system (
            {order.paymentMethod === 'PowerOfficeEmailInvoice' ? 'email' : 'ehf'})
          </Button>
        )}
      </Drawer>
    </>
  );
};

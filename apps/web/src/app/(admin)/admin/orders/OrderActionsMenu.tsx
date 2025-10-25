'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Definition, DescriptionList, Term } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import { OrderDto, PaymentProvider } from '@/lib/eventuras-sdk';

import { invoiceOrderAction, verifyOrderAction } from './actions';

const logger = Logger.create({
  namespace: 'web:admin:orders',
  context: { component: 'OrderActionsMenu' },
});
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
  const handleVerifyOrder = async () => {
    if (!order.orderId) {
      logger.error('Order ID is required');
      return;
    }

    try {
      await verifyOrderAction(order.orderId);
      logger.info({ orderId: order.orderId }, 'Order verified successfully');
      router.refresh();
    } catch (error) {
      logger.error({ error, orderId: order.orderId }, 'Failed to verify order');
    }
  };

  const handleInvoiceOrder = async () => {
    if (!order.orderId) {
      logger.error('Order ID is required');
      return;
    }

    try {
      await invoiceOrderAction(order.orderId);
      logger.info({ orderId: order.orderId }, 'Invoice created successfully');
      setInvoiceDrawerOpen(false);
      router.refresh();
    } catch (error) {
      logger.error({ error, orderId: order.orderId }, 'Failed to create invoice');
    }
  };
  return (
    <>
      {order.status === 'Draft' && (
        <Button variant="primary" onClick={handleVerifyOrder}>
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
          <Button onClick={handleInvoiceOrder}>
            Send to accounting system (
            {order.paymentMethod === 'PowerOfficeEmailInvoice' ? 'email' : 'ehf'})
          </Button>
        )}
      </Drawer>
    </>
  );
};

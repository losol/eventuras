'use client';

import { InvoiceRequestDto, OrderDto, OrderStatus, PaymentProvider } from '@eventuras/sdk';
import { Button, Drawer, Heading } from '@eventuras/ui';
import { Definition, DescriptionList, Term } from '@eventuras/ui/DescriptionList';
import { Logger } from '@eventuras/utils';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

export type OrderActionsMenuProps = {
  order: OrderDto;
};

export const OrderActionsMenu = ({ order }: OrderActionsMenuProps) => {
  const { t } = createTranslation();
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);
  const router = useRouter();
  Logger.info({ namespace: 'invoicing:order' }, order);
  Logger.info({ namespace: 'invoicing:registration' }, order.registration);

  const verifyOrder =
    ({ order }: { order: OrderDto }) =>
    async () => {
      if (!order.orderId) {
        throw new Error('Order ID is required');
      }
      const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
      await eventuras.orders.patchV3Orders({
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
        id: order.orderId,
        requestBody: [
          {
            op: 'replace',
            path: '/status',
            value: OrderStatus.VERIFIED,
          },
        ],
      });
      router.refresh();
    };

  const invoiceOrder = async (order: OrderDto) => {
    const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

    if (!order.orderId) {
      throw new Error('Order ID is required');
    }

    const invoiceRequest: InvoiceRequestDto = {
      orderIds: [order.orderId],
    };

    const invoice = await apiWrapper(() =>
      eventuras.invoices.postV3Invoices({
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
        requestBody: invoiceRequest,
      })
    );

    if (invoice.ok) {
      Logger.info({ namespace: 'invoicing:order' }, 'Invoice sent to accounting system');
    }
    router.refresh();
  };

  return (
    <>
      {order.status === OrderStatus.DRAFT && (
        <Button variant="primary" onClick={verifyOrder({ order })}>
          Verify
        </Button>
      )}
      {order.status !== OrderStatus.DRAFT && (
        <Button variant="primary" onClick={() => setInvoiceDrawerOpen(!invoiceDrawerOpen)}>
          {t('admin:labels.invoice')}
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
        {order.status == OrderStatus.VERIFIED &&
          order.paymentMethod ==
            (PaymentProvider.POWER_OFFICE_EMAIL_INVOICE ||
              PaymentProvider.POWER_OFFICE_EHFINVOICE) && (
            <Button onClick={() => invoiceOrder(order)}>
              Send to accounting system (
              {order.paymentMethod == PaymentProvider.POWER_OFFICE_EMAIL_INVOICE ? 'email' : 'ehf'})
            </Button>
          )}
      </Drawer>
    </>
  );
};

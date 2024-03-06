'use client';

import { OrderDto } from '@eventuras/sdk';
import { Button, Drawer, Heading } from '@eventuras/ui';
import { Definition, DescriptionList, Term } from '@eventuras/ui/DescriptionList';
import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import Logger from '@/utils/Logger';

export type OrderActionsMenuProps = {
  order: OrderDto;
};

export const OrderActionsMenu = ({ order }: OrderActionsMenuProps) => {
  const { t } = createTranslation();
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);
  Logger.info({ namespace: 'invoicing:order' }, order);
  Logger.info({ namespace: 'invoicing:registration' }, order.registration);
  return (
    <>
      <Button variant="primary" onClick={() => setInvoiceDrawerOpen(!invoiceDrawerOpen)}>
        {t('admin:labels.invoice')}
      </Button>
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
      </Drawer>
    </>
  );
};

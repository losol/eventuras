'use client';

import React from 'react';
import { Button, useDocumentInfo, useForm, useFormFields } from '@payloadcms/ui';

import { CancelPaymentButton } from './CancelPaymentButton';
import { RefundPaymentButton } from './RefundPaymentButton';
import { ShipCompleteOrderButton } from './ShipCompleteOrderButton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OrderSaveButton: React.FC<any> = () => {
  const { id } = useDocumentInfo();
  const status = useFormFields(([fields]) => fields.status);
  const { submit } = useForm();

  return (
    <>
      <CancelPaymentButton orderId={id as string} orderStatus={status?.value as string} />
      <ShipCompleteOrderButton orderId={id as string} orderStatus={status?.value as string} />
      <RefundPaymentButton orderId={id as string} orderStatus={status?.value as string} />
      <Button onClick={() => submit()}>Save</Button>
    </>
  );
};

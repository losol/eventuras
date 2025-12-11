'use client';

import React from 'react';
import { Button, useDocumentInfo, useForm, useFormFields } from '@payloadcms/ui';

import { ShipCompleteOrderButton } from './ShipCompleteOrderButton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OrderSaveButton: React.FC<any> = () => {
  const { id } = useDocumentInfo();
  const status = useFormFields(([fields]) => fields.status);
  const { submit } = useForm();

  return (
    <>
      <ShipCompleteOrderButton orderId={id as string} orderStatus={status?.value as string} />
      <Button onClick={() => submit()}>Save</Button>
    </>
  );
};

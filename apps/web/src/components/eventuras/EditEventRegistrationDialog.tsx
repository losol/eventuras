'use client';

import { ProductDto, RegistrationDto } from '@eventuras/sdk';
import Button from '@eventuras/ui/Button';
import Dialog from '@eventuras/ui/Dialog';
import { useState } from 'react';

import RegistrationCustomize from '@/app/user/events/[id]/eventflow/RegistrationCustomize';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import {
  addProductsToRegistration,
  productMapToOrderLineModel,
} from '@/utils/api/functions/events';
import Logger from '@/utils/Logger';

export type EditEventOrdersDialogProps = {
  eventProducts: ProductDto[];
  currentRegistration: RegistrationDto;
  title?: string;
  description?: string;
  startOpened?: boolean;
  withButton?: boolean;
  onClose?: (registrationChanged: boolean) => void;
};

const EditEventRegistrationsDialog = (props: EditEventOrdersDialogProps) => {
  const [editorOpen, setEditorOpen] = useState<boolean>(props.startOpened ?? false);
  const { addAppNotification } = useAppNotifications();

  const onSubmit = async (selected: Map<string, number>) => {
    Logger.info({ namespace: 'editregistration' }, selected);
    const updateProductResult = await addProductsToRegistration(
      props.currentRegistration.registrationId!,
      productMapToOrderLineModel(selected)
    ).catch(e => {
      //TODO server kicks a 500 when trying to sending unchanged form, lets ignore for now
      Logger.error({ namespace: 'editregistration' }, e);
      return { ok: false };
    });
    if (updateProductResult.ok) {
      addAppNotification({
        id: Date.now(),
        message: 'Registration edited succesfully!',
        type: AppNotificationType.SUCCESS,
      });
    } else {
      addAppNotification({
        id: Date.now(),
        message: 'Something went wrong, please try again later',
        type: AppNotificationType.ERROR,
      });
    }

    setEditorOpen(false);
    if (props.onClose) props.onClose(updateProductResult.ok);
  };
  return (
    <>
      {!props.withButton && (
        <Button
          onClick={() => {
            setEditorOpen(true);
          }}
          data-test-id="edit-orders-button"
        >
          {props.title ?? 'Edit Orders'}
        </Button>
      )}
      <Dialog
        title="Edit Orders"
        isOpen={editorOpen}
        data-test-id="edit-orders-dialog"
        onClose={() => {
          setEditorOpen(false);
          if (props.onClose) {
            props.onClose(false);
          }
        }}
      >
        <div className="mt-2">
          <p>
            {props.description ??
              `Go ahead and edit your orders below. Please note that mandatory products of an event
            cannot be changed directly, please contact an administrator instead.`}
          </p>
        </div>
        <div>
          <RegistrationCustomize
            products={props.eventProducts}
            selectedProducts={props.currentRegistration.products!}
            onSubmit={onSubmit}
          />
        </div>
      </Dialog>
    </>
  );
};

export default EditEventRegistrationsDialog;

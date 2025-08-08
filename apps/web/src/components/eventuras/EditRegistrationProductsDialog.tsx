'use client';

import { ProductDto, RegistrationDto } from '@eventuras/sdk';
import { Button } from '@eventuras/ratio-ui';
import { DATA_TEST_ID, Logger } from '@eventuras/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import RegistrationCustomize from '@/app/user/events/[id]/eventflow/RegistrationCustomize';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import {
  addProductsToRegistration,
  productMapToOrderLineModel,
} from '@/utils/api/functions/events';

export type EditRegistrationProductsDialogProps = {
  eventProducts: ProductDto[];
  currentRegistration: RegistrationDto;
  title?: string;
  description?: string;
  startOpened?: boolean;
  withButton?: boolean;
  onClose?: (registrationChanged: boolean) => void;
};

const EditRegistrationProductsDialog = (props: EditRegistrationProductsDialogProps) => {
  const [editorOpen, setEditorOpen] = useState<boolean>(props.startOpened ?? false);
  const { addAppNotification } = useAppNotifications();
  const router = useRouter();

  const onSubmit = async (selected: Map<string, number>) => {
    Logger.info({ namespace: 'editregistration' }, selected);
    const updateProductResult = await addProductsToRegistration(
      props.currentRegistration.registrationId!,
      productMapToOrderLineModel(selected)
    ).catch(e => {
      Logger.error({ namespace: 'editregistration' }, e);
      return { ok: false };
    });
    if (updateProductResult.ok) {
      addAppNotification({
        message: 'Registration edited succesfully!',
        type: AppNotificationType.SUCCESS,
      });
      router.refresh();
    } else {
      addAppNotification({
        message: 'Something went wrong, please try again later',
        type: AppNotificationType.ERROR,
      });
      router.refresh();
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
          {...{ [DATA_TEST_ID]: 'edit-orders-button' }}
        >
          {props.title ?? 'Edit Orders'}
        </Button>
      )}
      <Dialog
        title="Edit Orders"
        isOpen={editorOpen}
        {...{ [DATA_TEST_ID]: 'edit-orders-dialog' }}
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

export default EditRegistrationProductsDialog;

'use client';

import { ProductDto } from '@losol/eventuras/dist/models/ProductDto';
import { RegistrationDto } from '@losol/eventuras/dist/models/RegistrationDto';
import { useState } from 'react';

import RegistrationCustomize from '@/app/user/events/[id]/registration/RegistrationCustomize';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import {
  addProductsToRegistration,
  productMapToOrderLineModel,
} from '@/utils/api/functions/events';
import Logger from '@/utils/Logger';

import Button from '../ui/Button';
import Dialog from '../ui/Dialog';

export type EditEventOrdersDialogProps = {
  availbleProducts: ProductDto[];
  currentRegistration: RegistrationDto;
};

const EditEventRegistrationsDialog = (props: EditEventOrdersDialogProps) => {
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const { addAppNotification } = useAppNotifications();

  const onSubmit = async (selected: Map<string, number>) => {
    Logger.info({ namespace: 'editregistration' }, selected);

    const updateProductResult = await addProductsToRegistration(
      props.currentRegistration.registrationId!,
      productMapToOrderLineModel(selected)
    );
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
  };
  return (
    <>
      <Button
        onClick={() => {
          setEditorOpen(true);
        }}
      >
        Edit Orders
      </Button>
      <Dialog
        title="Edit Orders"
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
        }}
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Go ahead and edit your orders below. Please note that mandatory products of an event
            cannot be changed directly, please contact an administrator instead.
          </p>
        </div>
        <div>
          <RegistrationCustomize
            products={props.availbleProducts}
            currentRegistration={props.currentRegistration}
            onSubmit={onSubmit}
          />
        </div>
      </Dialog>
    </>
  );
};

export default EditEventRegistrationsDialog;

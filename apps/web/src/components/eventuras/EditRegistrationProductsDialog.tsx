'use client';
import { ProductDto, RegistrationDto } from '@eventuras/event-sdk';
import { Button } from '@eventuras/ratio-ui/core/Button';

;
;
import { Logger } from '@eventuras/logger';
const logger = Logger.create({
  namespace: 'web:components:eventuras',
  context: { component: 'EditRegistrationProductsDialog' },
});
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RegistrationCustomize from '@/app/(user)/user/events/[id]/eventflow/RegistrationCustomize';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { useToast } from '@eventuras/toast';
import { addProductsToExistingRegistration } from '@/app/(user)/user/events/actions';
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
  const toast = useToast();
  const router = useRouter();
  const onSubmit = async (selected: Map<string, number>) => {
    logger.info({ selected }, 'Updating registration products');
    try {
      const result = await addProductsToExistingRegistration(
        props.currentRegistration.registrationId!,
        selected
      );
      if (result.success) {
        toast.success(result.message || 'Registration edited successfully!');
        router.refresh();
        setEditorOpen(false);
        if (props.onClose) props.onClose(true);
      } else {
        logger.error({ error: result.error }, 'Failed to update registration products');
        toast.error(result.error.message);
        setEditorOpen(false);
        if (props.onClose) props.onClose(false);
      }
    } catch (e) {
      logger.error({ error: e }, 'Failed to update registration products');
      toast.error('Something went wrong, please try again later');
      setEditorOpen(false);
      if (props.onClose) props.onClose(false);
    }
  };
  return (
    <>
      {!props.withButton && (
        <Button
          onClick={() => {
            setEditorOpen(true);
          }}
          testId="edit-orders-button"
        >
          {props.title ?? 'Edit Orders'}
        </Button>
      )}
      <Dialog
        title="Edit Orders"
        isOpen={editorOpen}
        testId="edit-orders-dialog"
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
'use client';

import { Dialog } from '@headlessui/react';
import type { NewProductDto, ProductDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Form from '@/components/forms/Form';
import NumberInput from '@/components/forms/src/inputs/NumberInput';
import TextAreaInput from '@/components/forms/src/inputs/TextAreaInput';
import TextInput from '@/components/forms/src/inputs/TextInput';
import Button from '@/components/ui/Button';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { ApiState, apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';

import ConfirmDiscardModal from './ConfirmDiscardModal';

interface ProductModalProps {
  isOpen: boolean;
  onSubmit: (values: ProductDto) => void;
  onClose: () => void;
  product?: ProductDto;
  eventId: number;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onSubmit,
  onClose,
  product,
  eventId,
}) => {
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const { addAppNotification } = useAppNotifications();

  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const { reset } = useForm<ProductDto>({ defaultValues: product || {} });
  const { t } = createTranslation();

  useEffect(() => {
    reset(product || {});
  }, [product, reset]);

  const isEditMode = Boolean(product);
  const buttonText = isEditMode
    ? t('admin:products.buttons.edit-product')
    : t('admin:products.buttons.add-product');
  const titleText = isEditMode
    ? t('admin:products.modal.title.edit')
    : t('admin:products.modal.title.add-product');

  // Product modal submit handler
  const submitProduct: SubmitHandler<ProductDto> = async (data: ProductDto) => {
    setApiState({ error: null, loading: true });
    const editMode = data.productId ? true : false;

    // Remember to set loading state
    setApiState({ error: null, loading: true });

    if (isEditMode && product) {
      Logger.info({ namespace: 'ProductEditor' }, 'Editing product:', data);
    } else {
      Logger.info({ namespace: 'ProductEditor' }, 'Adding product:', data);
    }

    const result = editMode
      ? await apiWrapper(() =>
          eventuras.eventProducts.putV3EventsProducts({
            eventId: eventId,
            productId: product!.productId!,
            requestBody: data,
          })
        )
      : await apiWrapper(() =>
          eventuras.eventProducts.postV3EventsProducts({
            eventId: eventId,
            requestBody: data as NewProductDto,
          })
        );

    if (result.ok) {
      onSubmit(result.value);
      addAppNotification({
        id: Date.now(),
        message: 'Product was updated!',
        type: AppNotificationType.SUCCESS,
      });
    } else {
      addAppNotification({
        id: Date.now(),
        message: `Something bad happended: ${result.error}!`,
        type: AppNotificationType.ERROR,
      });
    }

    // Close the modal
    setApiState({ error: null, loading: false });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-700 text-color-gray-100 shadow-xl rounded-2xl">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              {titleText}
            </Dialog.Title>

            <Form onSubmit={submitProduct} className="mt-2 space-y-6" defaultValues={product}>
              <TextInput
                name="name"
                label="Name"
                placeholder="Product Name"
                dataTestId="product-name-input"
                required
              />
              <TextAreaInput
                name="description"
                label="Description"
                placeholder="Product Description"
                dataTestId="product-description-input"
              />
              <NumberInput
                name="price"
                label="Price"
                placeholder="Price"
                dataTestId="product-price-input"
                required
              />
              <NumberInput
                name="vatPercent"
                label="VAT Percent"
                placeholder="VAT Percent"
                dataTestId="product-vat-input"
                defaultValue={0}
                required
              />
              <Button type="submit" disabled={apiState.loading}>
                {buttonText}
              </Button>
              <Button type="reset" variant="secondary" onClick={onClose}>
                {t('common:buttons.cancel')}
              </Button>
            </Form>
          </Dialog.Panel>
        </div>
      </Dialog>

      <ConfirmDiscardModal
        isOpen={confirmDiscardChanges}
        onClose={() => setConfirmDiscardChanges(false)}
        onConfirm={onClose}
        title="Discard Changes?"
        description="Are you sure you want to discard your changes?"
      />
    </>
  );
};

export default ProductModal;

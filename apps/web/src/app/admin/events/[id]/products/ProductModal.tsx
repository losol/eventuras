'use client';

import type { NewProductDto, ProductDto } from '@eventuras/sdk';
import { Form, Input, NumberInput } from '@eventuras/smartform';
import { Button, Heading } from '@eventuras/ui';
import { DATA_TEST_ID, Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Dialog from '@/components/Dialog';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { ApiState, apiWrapper, createSDK } from '@/utils/api/EventurasApi';

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
  const t = await getTranslations();

  useEffect(() => {
    reset(product || {});
  }, [product, reset]);

  const isEditMode = Boolean(product);
  const buttonText = isEditMode ? t('common.labels.edit') : t('common.labels.save');
  const titleText = isEditMode
    ? t('admin.products.modal.title.edit')
    : t('admin.products.modal.title.add-product');

  // Product modal submit handler
  const submitProduct: SubmitHandler<ProductDto> = async (data: ProductDto) => {
    setApiState({ error: null, loading: true });
    const editMode = data.productId;

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
      <Dialog isOpen={isOpen} onClose={onClose} title={titleText}>
        {/* The backdrop first */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Then the dialogue... */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-700 text-color-gray-100 shadow-xl rounded-2xl">
            <Form onSubmit={submitProduct} className="mt-2 space-y-6" defaultValues={product}>
              <Input
                name="name"
                label={t('common.products.labels.name')}
                placeholder={t('common.products.labels.name')}
                {...{ [DATA_TEST_ID]: 'product-name-input' }}
                required
              />
              <Input
                name="description"
                label={t('common.products.labels.description')}
                placeholder={t('common.products.labels.description')}
                {...{ [DATA_TEST_ID]: 'product-description-input' }}
                multiline
              />
              <NumberInput
                name="price"
                label={t('common.products.labels.price')}
                placeholder="1234"
                {...{ [DATA_TEST_ID]: 'product-price-input' }}
                required
              />
              <NumberInput
                name="vatPercent"
                label={t('common.products.labels.vatPercent')}
                placeholder="0"
                {...{ [DATA_TEST_ID]: 'product-vat-input' }}
                defaultValue={0}
                required
              />
              <NumberInput
                name="minimumQuantity"
                label={t('common.products.labels.minimumQuantity')}
                placeholder="0"
                {...{ [DATA_TEST_ID]: 'product-minimum-quantity-input' }}
              />
              <Button type="submit" disabled={apiState.loading}>
                {buttonText}
              </Button>
              <Button type="reset" variant="secondary" onClick={onClose}>
                {t('common.buttons.cancel')}
              </Button>
            </Form>
          </div>
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

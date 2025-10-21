'use client';
import type { NewProductDto, ProductDto } from '@eventuras/event-sdk';
import { Form, Input, NumberInput } from '@eventuras/smartform';
import { Button } from '@eventuras/ratio-ui/core/Button';

;
;
import { Logger } from '@eventuras/logger';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { useToast } from '@eventuras/toast';
import ConfirmDiscardModal from './ConfirmDiscardModal';
import { createProduct, updateProduct } from './actions';
const logger = Logger.create({
  namespace: 'web:admin',
  context: { component: 'ProductModal' },
});
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
  eventId
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const { reset } = useForm<ProductDto>({ defaultValues: product || {} });
  const t = useTranslations();
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
    setLoading(true);
    try {
      if (isEditMode && product?.productId) {
        logger.info({ product: data }, 'Editing product');
        const result = await updateProduct(eventId, product.productId, data);
        if (!result.success) {
          logger.error({ error: result.error }, 'Failed to update product');
          toast.error(result.error.message);
          setLoading(false);
          return;
        }
        onSubmit(result.data);
        toast.success(result.message || 'Product was updated!');
      } else {
        logger.info({ product: data }, 'Adding product');
        const result = await createProduct(eventId, data as NewProductDto);
        if (!result.success) {
          logger.error({ error: result.error }, 'Failed to create product');
          toast.error(result.error.message);
          setLoading(false);
          return;
        }
        onSubmit(result.data);
        toast.success(result.message || 'Product was created!');
      }
      // Close the modal on success
      onClose();
    } catch (error) {
      logger.error({ error }, 'Unexpected error in submitProduct');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose} title={titleText}>
        <div className="fixed inset-0 z-40 bg-blue/30" aria-hidden="true" />
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <Form onSubmit={submitProduct} className="mt-2 space-y-6" defaultValues={product}>
              <Input
                name="name"
                label={t('common.products.labels.name')}
                placeholder={t('common.products.labels.name')}
                testId="product-name-input"
                required
              />
              <Input
                name="description"
                label={t('common.products.labels.description')}
                placeholder={t('common.products.labels.description')}
                testId="product-description-input"
                multiline
              />
              <NumberInput
                name="price"
                label={t('common.products.labels.price')}
                placeholder="1234"
                testId="product-price-input"
                required
              />
              <NumberInput
                name="vatPercent"
                label={t('common.products.labels.vatPercent')}
                placeholder="0"
                testId="product-vat-input"
                defaultValue={0}
                required
              />
              <NumberInput
                name="minimumQuantity"
                label={t('common.products.labels.minimumQuantity')}
                placeholder="0"
                testId="product-minimum-quantity-input"
              />
              <Button type="submit" disabled={loading}>
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
'use client';

import { Dialog } from '@headlessui/react';
import type { ProductDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Logger from '@/utils/Logger';

import ConfirmDiscardModal from './ConfirmDiscardModal';

interface ProductModalProps {
  isOpen: boolean;
  onSubmit: (values: ProductDto) => void;
  onClose: () => void;
  product?: ProductDto;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onSubmit, onClose, product }) => {
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProductDto>({ defaultValues: product || {} });
  const { t } = createTranslation();

  useEffect(() => {
    // When the product prop changes, reset the form with new values
    if (product) {
      reset(product);
    }
  }, [product, reset]);

  const isEditMode = Boolean(product);
  const buttonText = isEditMode
    ? t('admin:products.buttons.edit-product')
    : t('admin:products.buttons.add-product');
  const titleText = isEditMode
    ? t('admin:products.modal.title.edit')
    : t('admin:products.modal.title.add-product');

  const inputClassName =
    'w-full p-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:text-gray-100';

  const handleFormSubmit = handleSubmit(data => {
    Logger.info(
      { namespace: isEditMode ? 'editproduct' : 'addproduct' },
      'Handle this product:',
      data
    );

    if (isEditMode && product) {
      onSubmit({ ...data, productId: product.productId });
    } else {
      onSubmit(data);
    }

    // And close the modal
    onClose();
  });

  const handleCloseClick = () => {
    if (isDirty) {
      setConfirmDiscardChanges(true);
    } else {
      // Just close if nothing was changed
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleCloseClick}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-700 text-color-gray-100 shadow-xl rounded-2xl">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              {titleText}
            </Dialog.Title>

            <form onSubmit={handleFormSubmit} className="mt-2 space-y-6">
              <div>
                <input
                  {...register('name', { required: true })}
                  placeholder="Product Name"
                  className={inputClassName}
                  data-test-id="product-name-input"
                />
              </div>
              <div>
                <textarea
                  {...register('description')}
                  placeholder="Product Description"
                  className={inputClassName}
                  rows={3}
                  data-test-id="product-description-input"
                />
              </div>
              <div>
                <input
                  {...register('more')}
                  placeholder="Additional Information"
                  className={inputClassName}
                  data-test-id="product-additional-input"
                />
              </div>
              <div>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="Price"
                  className={inputClassName}
                  data-test-id="product-price-input"
                />
              </div>
              <div>
                <input
                  type="number"
                  {...register('vatPercent', { valueAsNumber: true })}
                  placeholder="VAT Percent"
                  className={inputClassName}
                  defaultValue={0}
                  data-test-id="product-vat-input"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {buttonText}
                </button>
                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common:buttons.cancel')}
                </button>
              </div>
            </form>
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

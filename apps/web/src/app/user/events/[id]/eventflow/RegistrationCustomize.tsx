'use client';

import { ProductDto } from '@eventuras/sdk';
import Button from '@eventuras/ui/Button';
import createTranslation from 'next-translate/createTranslation';
import { useForm } from 'react-hook-form';

import ProductSelection from '@/components/forms/ProductSelection';
import { ProductSelected } from '@/types';
import { mapSelectedProductsToQuantity } from '@/utils/api/mappers';

type SubmitCallback = (values: Map<string, number>) => void;

export type RegistrationCustomizeProps = {
  products: ProductDto[];
  selectedProducts?: ProductSelected[];
  onSubmit: SubmitCallback;
  onBack?: () => void;
};

export type SelectedProducts = {
  products: ProductDto[];
};

const createFormHandler = (products: ProductDto[], onSubmit: SubmitCallback) => (data: any) => {
  const submissionMap = mapSelectedProductsToQuantity(products, data);
  onSubmit(submissionMap);
};

const RegistrationCustomize = ({
  products,
  onSubmit,
  onBack,
  selectedProducts,
}: RegistrationCustomizeProps) => {
  const { t } = createTranslation();
  const { register, handleSubmit } = useForm();
  return (
    <>
      <form onSubmit={handleSubmit(createFormHandler(products, onSubmit))} className="py-10">
        <ProductSelection
          products={products}
          register={register}
          selectedProducts={selectedProducts ?? []}
        />
        {onBack && <Button onClick={onBack}>{t('common:buttons.back')}</Button>}

        <Button type="submit" data-test-id="registration-customize-submit-button">
          {t('common:buttons.continue')}
        </Button>
      </form>
    </>
  );
};

export default RegistrationCustomize;

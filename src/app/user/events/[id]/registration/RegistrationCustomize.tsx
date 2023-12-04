'use client';

import { ProductDto, RegistrationDto } from '@losol/eventuras';
import { ProductDto, RegistrationDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import { useForm } from 'react-hook-form';

import ProductSelection from '@/components/forms/ProductSelection';
import Button from '@/components/ui/Button';
import { mapSelectedProductsToQuantity } from '@/utils/api/mappers';

type SubmitCallback = (values: Map<string, number>) => void;

export type RegistrationCustomizeProps = {
  products: ProductDto[];
  currentRegistration?: RegistrationDto | null;
  onSubmit: SubmitCallback;
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
  currentRegistration,
}: RegistrationCustomizeProps) => {
  const { t } = createTranslation();
  const { register, handleSubmit, formState } = useForm();
  const formIsChanged = !!Object.keys(formState.dirtyFields).length;
  return (
    <>
      <form onSubmit={handleSubmit(createFormHandler(products, onSubmit))} className="py-10">
        <ProductSelection
          products={products}
          register={register}
          selectedProducts={currentRegistration?.products ?? []}
        />
        <Button type="submit" data-test-id="registration-customize-submit-button">
          {t('common:buttons.continue')}
        </Button>
      </form>
    </>
  );
};

export default RegistrationCustomize;

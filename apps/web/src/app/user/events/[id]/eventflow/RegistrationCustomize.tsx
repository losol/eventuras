'use client';

import { ProductDto } from '@eventuras/sdk';
import { Button } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';
import { useForm } from 'react-hook-form';

import ProductSelection from '@/components/eventuras/ProductSelection';
import { useAuthSelector } from '@/statemachines/AuthenticationFlowMachine';
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

const createFormHandler =
  (products: ProductDto[], onSubmit: SubmitCallback, isAdmin: boolean) => (data: any) => {
    const submissionMap = mapSelectedProductsToQuantity(products, data, isAdmin);
    onSubmit(submissionMap);
  };

const RegistrationCustomize = ({
  products,
  onSubmit,
  onBack,
  selectedProducts,
}: RegistrationCustomizeProps) => {
  const { isAdmin } = useAuthSelector();

  const { t } = createTranslation();
  const { register, handleSubmit } = useForm();
  return (
    <>
      <form
        onSubmit={handleSubmit(createFormHandler(products, onSubmit, isAdmin))}
        className="py-10"
      >
        <ProductSelection
          isAdmin={isAdmin}
          products={products}
          register={register}
          selectedProducts={selectedProducts ?? []}
        />
        {onBack && <Button onClick={onBack}>{t('common:buttons.back')}</Button>}

        <Button type="submit" {...{ [DATA_TEST_ID]: 'registration-customize-submit-button' }}>
          {t('common:buttons.continue')}
        </Button>
      </form>
    </>
  );
};

export default RegistrationCustomize;

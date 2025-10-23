'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { useAuthSelector } from '@/auth/authMachine';
import ProductSelection from '@/components/eventuras/ProductSelection';
import { ProductDto } from "@/lib/eventuras-sdk";
import { ProductSelected } from '@/types';
import { mapSelectedProductsToQuantity } from '@/utils/api/mappers';

import { logStepComplete, logStepEntry, logUserAction } from '../../lib/eventFlowLogger';
type SubmitCallback = (values: Map<string, number>) => void;
export type Step02ProductCustomizationProps = {
  products: ProductDto[];
  selectedProducts?: ProductSelected[];
  onSubmit: SubmitCallback;
  onBack?: () => void;
};
const createFormHandler =
  (products: ProductDto[], onSubmit: SubmitCallback, isAdmin: boolean) => (data: unknown) => {
    logStepComplete('02', 'ProductCustomization', {
      productCount: products.length,
    });
    const submissionMap = mapSelectedProductsToQuantity(products, data, isAdmin);
    onSubmit(submissionMap);
  };
const Step02ProductCustomization = ({
  products,
  onSubmit,
  onBack,
  selectedProducts,
}: Step02ProductCustomizationProps) => {
  const { isAdmin } = useAuthSelector();
  const t = useTranslations();
  const { register, handleSubmit } = useForm();
  useEffect(() => {
    logStepEntry('02', 'ProductCustomization', {
      productCount: products.length,
      hasSelectedProducts: (selectedProducts?.length ?? 0) > 0,
    });
  }, [products.length, selectedProducts?.length]);
  const handleBack = () => {
    logUserAction('Back from product customization');
    onBack?.();
  };
  return (
    <div className="max-w-4xl mx-auto">
      <Heading as="h2" className="mb-6">
        {t('user.registration.steps.products.title')}
      </Heading>
      <form
        onSubmit={handleSubmit(createFormHandler(products, onSubmit, isAdmin))}
        className="space-y-6"
      >
        <ProductSelection
          isAdmin={isAdmin}
          products={products}
          register={register}
          selectedProducts={selectedProducts ?? []}
        />
        <div className="flex gap-4">
          {onBack && (
            <Button onClick={handleBack} variant="outline">
              {t('common.buttons.back')}
            </Button>
          )}
          <Button type="submit" testId="registration-customize-submit-button" variant="primary">
            {t('common.buttons.continue')}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default Step02ProductCustomization;

import useTranslation from 'next-translate/useTranslation';
import { useForm } from 'react-hook-form';

import ProductSelection from '@/components/forms/ProductSelection';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import { RegistrationProduct } from '@/types/RegistrationProduct';
import { mapSelectedProductsToQuantity } from '@/utils/api/mappers';

type SubmitCallback = (values: Map<string, number>) => void;

export type RegistrationCustomizeProps = {
  products: RegistrationProduct[];
  onSubmit: SubmitCallback;
};

const createFormHandler =
  (products: RegistrationProduct[], onSubmit: SubmitCallback) => (data: any) => {
    const submissionMap = mapSelectedProductsToQuantity(products, data);
    onSubmit(submissionMap);
  };

const RegistrationCustomize = ({ products, onSubmit }: RegistrationCustomizeProps) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm();

  return (
    <>
      <section className="bg-gray-100 dark:bg-gray-800"></section>
      <Heading className="container">{t('register.customize.title')}</Heading>
      <p className="container pb-12">{t('register.customize.description')}</p>
      <form onSubmit={handleSubmit(createFormHandler(products, onSubmit))} className="container">
        <ProductSelection products={products} register={register} />
        <Button type="submit">{t('common.buttons.continue')}</Button>
      </form>
    </>
  );
};

export default RegistrationCustomize;

import useTranslation from 'next-translate/useTranslation';
import { useForm } from 'react-hook-form';

import { Heading } from '@/components/content';
import { Button } from '@/components/inputs';
import Checkbox from '@/components/inputs/Checkbox';
import { RegistrationProduct } from '@/types/RegistrationProduct';

type SubmitCallback = (values: Map<string, number>) => void;

export type RegistrationCustomizeProps = {
  products: RegistrationProduct[];
  onSubmit: SubmitCallback;
};

const createFormHandler =
  (products: RegistrationProduct[], onSubmit: SubmitCallback) => (data: any) => {
    const submissionMap = new Map<string, number>();
    Object.keys(data).forEach((key: string) => {
      const relatedProduct = products.find(product => product.id === key);
      if (!relatedProduct) return;
      const formValue = data[key];
      let value = 0;
      if (relatedProduct.isBooleanSelection) {
        if (relatedProduct.mandatory || !!formValue) {
          value = 1;
        }
      } else {
        value = parseInt(formValue, 10);
      }
      submissionMap.set(key, value);
    });
    onSubmit(submissionMap);
  };

const RegistrationCustomize = ({ products, onSubmit }: RegistrationCustomizeProps) => {
  const { t } = useTranslation('register');
  const { register, handleSubmit } = useForm();

  return (
    <>
      <section className="bg-gray-100 dark:bg-gray-800"></section>
      <Heading className="container">{t('customize.title')}</Heading>
      <p className="container pb-12">{t('customize.description')}</p>
      <form onSubmit={handleSubmit(createFormHandler(products, onSubmit))} className="container">
        {products.map((product: RegistrationProduct) => {
          if (product.isBooleanSelection) {
            return (
              <Checkbox
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                {...register(product.id)}
                disabled={product.mandatory}
                defaultChecked={product.mandatory}
              >
                <Checkbox.Label>{product.title}</Checkbox.Label>
                <Checkbox.Description>{product.description}</Checkbox.Description>
              </Checkbox>
            );
          }
          return (
            <div key={product.id}>
              <input
                type="number"
                className="w-16 mb-3 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                defaultValue={product.minimumQuantity}
                min={product.minimumQuantity}
                {...register(product.id, {
                  min: {
                    value: product.minimumQuantity,
                    message: `Minimum is ${product.minimumQuantity}`,
                  },
                })}
              />
              <label htmlFor={product.id}>{product.title}</label>
              <p>{product.description}</p>
            </div>
          );
        })}
        <Button type="submit">Continue</Button>
      </form>
    </>
  );
};

export default RegistrationCustomize;

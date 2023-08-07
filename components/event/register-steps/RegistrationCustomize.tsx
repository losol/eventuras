'use client';

import { Heading, Text } from 'components/content';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type RegistrationProduct = {
  id: string | number;
  title: string;
  description: string;
  mandatory?: boolean;
};
export type RegistrationCustomizeProps = {
  products: RegistrationProduct[];
  onSubmit: (values: string[]) => void;
};

const RegistrationCustomize = ({ products, onSubmit }: RegistrationCustomizeProps) => {
  const defaultSelected = products
    .filter(product => product.mandatory === true)
    .map(product => product.id.toString());
  const { t } = useTranslation('register');
  const [selectedProducts, selectProducts] = useState<string[]>(defaultSelected);

  function handleCheckboxChange(productId: string) {
    if (selectedProducts.includes(productId)) {
      selectProducts(selectedProducts.filter(id => id !== productId));
    } else selectProducts(s => [...s, productId]);
  }

  return (
    <>
      <Heading>{t('customize.title')}</Heading>
      <Text>{t('customize.description')}</Text>

      <div className="flex flex-col">
        {products.map(product => (
          <div className="flex flex-col items-start" key={product.id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`check-${product.id.toString()}`}
                disabled={product.mandatory === true}
                checked={selectedProducts.includes(product.id.toString())}
                onClick={() => handleCheckboxChange(product.id.toString())}
              />
              <Label htmlFor={`check-${product.id.toString()}`}>{product.id.toString()}</Label>
            </div>
            <Text asChild>
              <em>{product.title}</em>
            </Text>
            <Text>{product.description}</Text>
          </div>
        ))}
      </div>

      <Button onClick={() => onSubmit(selectedProducts)} className="mb-5">
        Continue
      </Button>
    </>
  );
};

export default RegistrationCustomize;

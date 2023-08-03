import { Box, Button, Checkbox, Flex, Stack } from '@mantine/core';
import { Heading } from 'components/typography';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

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

  return (
    <>
      <Heading>{t('customize.title')}</Heading>
      <p>{t('customize.description')}</p>
      <Box>
        <Checkbox.Group
          defaultValue={selectedProducts}
          onChange={values => {
            selectProducts(values as string[]);
          }}
        >
          <Stack>
            {products.map(product => (
              <Flex align="flex-start" key={product.id}>
                <Checkbox
                  value={product.id.toString()}
                  disabled={product.mandatory === true}
                ></Checkbox>
                <Box>
                  <em>{product.title}</em>
                  <p>{product.description}</p>
                </Box>
              </Flex>
            ))}
          </Stack>
        </Checkbox.Group>
      </Box>
      <Button onClick={() => onSubmit(selectedProducts)} mb="20px">
        Continue
      </Button>
    </>
  );
};

export default RegistrationCustomize;

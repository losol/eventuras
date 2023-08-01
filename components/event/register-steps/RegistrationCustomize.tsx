import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Heading,
  Stack,
} from '@chakra-ui/react';
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
  onSubmit: Function;
};

const RegistrationCustomize = ({
  products,
  onSubmit,
}: RegistrationCustomizeProps) => {
  const defaultSelected = products
    .filter(product => product.mandatory === true)
    .map(product => product.id.toString());
  const { t } = useTranslation('register');
  const [selectedProducts, selectProducts] =
    useState<string[]>(defaultSelected);

  return (
    <>
      <Heading>{t('customize.title')}</Heading>
      <p>{t('customize.description')}</p>
      <Box marginTop="5" marginBottom="5">
        <CheckboxGroup
          colorScheme="teal"
          defaultValue={selectedProducts}
          onChange={values => {
            selectProducts(values as string[]);
          }}
        >
          <Stack direction={['column']}>
            {products.map(product => (
              <Flex align="flex-start" key={product.id}>
                <Checkbox
                  value={product.id.toString()}
                  verticalAlign="top"
                  isDisabled={product.mandatory === true}
                ></Checkbox>
                <Box>
                  <em>{product.title}</em>
                  <p>{product.description}</p>
                </Box>
              </Flex>
            ))}
          </Stack>
        </CheckboxGroup>
      </Box>
      <Button
        colorScheme="teal"
        variant="solid"
        width="100%"
        onClick={() => onSubmit(selectedProducts)}
      >
        Continue
      </Button>
    </>
  );
};

export default RegistrationCustomize;

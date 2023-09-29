import { Meta, StoryObj } from '@storybook/react';

import { RegistrationProduct } from '@/types/RegistrationProduct';
import Logger from '@/utils/Logger';

import RegistrationCustomize from './RegistrationCustomize';

const meta: Meta<typeof RegistrationCustomize> = {
  title: 'Eventregistration/Customize',
  tags: ['autodocs'],
  component: RegistrationCustomize,
  args: {
    onSubmit: values => {
      Logger.info({}, values);
    },
  },
};

export default meta;

type Story = StoryObj<typeof RegistrationCustomize>;

const mandatoryProduct = {
  id: 'mandatory',
  title: 'This is an example mandatory product',
  description: "You can't miss out on this product",
  mandatory: true,
  isBooleanSelection: true,
} as RegistrationProduct;

const optionalProduct = {
  id: 'optional',
  title: 'This is an example optional product',
  description: 'You can deselect this product',
  mandatory: false,
  isBooleanSelection: true,
} as RegistrationProduct;

const minimumQuantityProduct = {
  id: 'minQuantity',
  title: 'This is a product with minimum quantity ',
  description: 'This product requires a minimum amount of orders',
  minimumQuantity: 4,
} as RegistrationProduct;

export const Default: Story = {
  args: {
    products: [],
  },
};

export const OneMandatoryProduct: Story = {
  args: {
    products: [mandatoryProduct],
  },
};

export const MandatoryAndOptionalProduct: Story = {
  args: {
    products: [mandatoryProduct, optionalProduct],
  },
};
export const MandatoryAndOptionalAndMinimumQuantityProduct: Story = {
  args: {
    products: [mandatoryProduct, optionalProduct, minimumQuantityProduct],
  },
};

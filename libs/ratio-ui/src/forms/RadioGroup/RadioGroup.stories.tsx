import { Meta, StoryFn } from '@storybook/react-vite';
import { RadioGroup, RadioGroupProps } from './RadioGroup';
import { useState } from 'react';

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  tags: ['autodocs'],
};

export default meta;

type RadioGroupStory = StoryFn<RadioGroupProps>;

export const Playground: RadioGroupStory = () => {
  const [value, setValue] = useState('option1');

  return (
    <RadioGroup
      name="demo"
      value={value}
      onChange={setValue}
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]}
    />
  );
};

export const WithLabel: RadioGroupStory = () => {
  const [value, setValue] = useState('standard');

  return (
    <RadioGroup
      name="shipping"
      label="Select Shipping Method"
      value={value}
      onChange={setValue}
      options={[
        { value: 'standard', label: 'Standard Shipping', price: '59 kr' },
        { value: 'express', label: 'Express Shipping', price: '99 kr' },
        { value: 'pickup', label: 'Store Pickup', price: 'Free' },
      ]}
    />
  );
};

export const WithDescriptions: RadioGroupStory = () => {
  const [value, setValue] = useState('basic');

  return (
    <RadioGroup
      name="plan"
      label="Choose a Plan"
      value={value}
      onChange={setValue}
      options={[
        {
          value: 'basic',
          label: 'Basic Plan',
          description: 'Perfect for individuals just getting started',
          price: '99 kr/month',
        },
        {
          value: 'pro',
          label: 'Pro Plan',
          description: 'For professionals who need advanced features',
          price: '299 kr/month',
        },
        {
          value: 'enterprise',
          label: 'Enterprise Plan',
          description: 'Custom solutions for large organizations',
          price: 'Contact us',
        },
      ]}
    />
  );
};

export const WithDisabledOption: RadioGroupStory = () => {
  const [value, setValue] = useState('available1');

  return (
    <RadioGroup
      name="product"
      label="Select Product"
      value={value}
      onChange={setValue}
      options={[
        { value: 'available1', label: 'Available Product 1', price: '199 kr' },
        { value: 'unavailable', label: 'Out of Stock', price: '249 kr', disabled: true },
        { value: 'available2', label: 'Available Product 2', price: '299 kr' },
      ]}
    />
  );
};

export const AllDisabled: RadioGroupStory = () => {
  const [value, setValue] = useState('option1');

  return (
    <RadioGroup
      name="disabled-group"
      label="Disabled Group"
      value={value}
      onChange={setValue}
      disabled
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]}
    />
  );
};

export const WithError: RadioGroupStory = () => {
  const [value, setValue] = useState('');

  return (
    <RadioGroup
      name="required"
      label="Select an Option (Required)"
      value={value}
      onChange={setValue}
      error="Please select an option"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]}
    />
  );
};

export const PaymentMethod: RadioGroupStory = () => {
  const [value, setValue] = useState('card');

  return (
    <RadioGroup
      name="payment"
      label="Payment Method"
      value={value}
      onChange={setValue}
      options={[
        { value: 'card', label: 'Credit Card', description: 'Pay with Visa, Mastercard or Amex' },
        { value: 'vipps', label: 'Vipps', description: 'Pay with your Vipps account' },
        { value: 'invoice', label: 'Invoice', description: 'Pay within 30 days' },
      ]}
    />
  );
};

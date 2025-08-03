import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { PhoneInput } from './PhoneInput';

const meta: Meta<typeof PhoneInput> = {
  title: 'Forms/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneInput>;

const errorMessages: Record<string, string> = {
  onlyDigits: 'Only digits are allowed',
  minLength: 'Phone number must be at least 6 digits',
  maxLength: 'Phone number must be at most 15 digits',
};

const DemoWrapper = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string | null;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {children}
    <div>
      <strong>Live Value:</strong> {value ?? '—'}
    </div>
  </div>
);

/** Default usage with Norway preselected */
export const Default: Story = {
  args: {
    label: 'Phone Number',
    description: 'Select your country',
  },
};

/** Playground showing live changes in the Storybook canvas */
export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <DemoWrapper value={value}>
        <PhoneInput
          {...args}
          onChange={({ fullNumber, localNumber }) => {
            setValue(localNumber.trim() === '' ? null : fullNumber);
          }}
        />
      </DemoWrapper>
    );
  },
  args: {
    label: 'Phone Number',
    description: 'Type a number to see live output',
  },
};

/** Validation example: shows an error when invalid characters are typed */
export const FailingValidation: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validate = (localNumber: string) => {
      if (/[^0-9]/.test(localNumber)) return errorMessages.onlyDigits;
      if (localNumber && localNumber.length < 6) return errorMessages.minLength;
      if (localNumber.length > 15) return errorMessages.maxLength;
      return null;
    };

    return (
      <DemoWrapper value={value}>
        <PhoneInput
          {...args}
          errors={error ? { phone: { message: error } } : {}}
          onChange={({ localNumber, fullNumber }) => {
            const validationResult = validate(localNumber);
            setError(typeof validationResult === 'string' ? validationResult : null);
            setValue(localNumber.trim() === '' ? null : fullNumber);
          }}
        />
      </DemoWrapper>
    );
  },
  args: {
    name: 'phone',
    label: 'Phone Number',
    description: 'Try typing + or letters to see validation in action',
  },
};


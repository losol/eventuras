import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { NumberField } from './NumberField';

const meta: Meta<typeof NumberField> = {
  title: 'Forms/NumberField',
  component: NumberField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible number input built on react-aria-components NumberField. Supports min/max/step, formatting (Intl.NumberFormat), and stepper buttons.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    errorMessage: { control: 'text' },
    variant: { control: 'select', options: ['separated', 'segmented'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    minValue: { control: 'number' },
    maxValue: { control: 'number' },
    step: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div className="min-w-[320px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic usage with label */
export const Basic: Story = {
  args: {
    label: 'Width',
    defaultValue: 1024,
    minValue: 0,
  },
};

/** Segmented variant (common for quantity controls) */
export const Segmented: Story = {
  args: {
    'aria-label': 'Quantity',
    variant: 'segmented',
    defaultValue: 2,
    minValue: 0,
  },
};

/** With description */
export const WithDescription: Story = {
  args: {
    label: 'Amount',
    description: 'Steps are calculated starting from the minimum.',
    defaultValue: 50,
    minValue: 0,
    maxValue: 150,
    step: 5,
  },
};

/** Disabled state */
export const Disabled: Story = {
  args: {
    label: 'Disabled',
    defaultValue: 10,
    isDisabled: true,
  },
};

/** Read-only state */
export const ReadOnly: Story = {
  args: {
    label: 'Read-only',
    value: 10,
    isReadOnly: true,
  },
};

/** With formatting (Intl.NumberFormatOptions via formatOptions) */
export const WithFormatOptions: Story = {
  args: {
    label: 'Price',
    defaultValue: 1999,
    formatOptions: { style: 'currency', currency: 'NOK' },
    minValue: 0,
  },
};

/** Simulated invalid state */
export const Invalid: Story = {
  args: {
    label: 'Age',
    defaultValue: 0,
    minValue: 1,
    isInvalid: true,
    errorMessage: 'Must be at least 1',
  },
};

/** Controlled example */
const ControlledExample = () => {
  const [value, setValue] = useState<number>(25);

  return (
    <div className="space-y-4">
      <NumberField label="Cookies to buy" value={value} onChange={setValue} minValue={0} />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current value: <span className="font-mono">{value}</span>
      </div>
      <button
        onClick={() => setValue(10)}
        className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
      >
        Set to 10
      </button>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

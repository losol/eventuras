import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import React, { useState } from 'react';
import { Select } from './Select';

const meta = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible select dropdown built on react-aria-components. Provides keyboard navigation, proper ARIA attributes, and focus management.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    onSelectionChange: { action: 'selectionChanged' },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'mango', label: 'Mango' },
  { value: 'strawberry', label: 'Strawberry' },
];

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'no', label: 'Norway' },
  { value: 'se', label: 'Sweden' },
  { value: 'dk', label: 'Denmark' },
];

/** Basic usage with label - click to open, select an option, verify it shows */
export const Basic: Story = {
  args: {
    label: 'Choose a fruit',
    placeholder: 'Select a fruit...',
    options: fruitOptions,
    testId: 'fruit-select',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show placeholder initially
    const trigger = canvas.getByTestId('fruit-select');
    await expect(trigger).toHaveTextContent('Select a fruit...');

    // Open dropdown and select "Orange"
    await userEvent.click(trigger);
    const option = within(document.body).getByRole('option', { name: 'Orange' });
    await userEvent.click(option);

    // Should now display the selected value
    await expect(trigger).toHaveTextContent('Orange');
  },
};

/** Without label (using aria-label) */
export const WithoutLabel: Story = {
  args: {
    'aria-label': 'Select a fruit',
    placeholder: 'Select a fruit...',
    options: fruitOptions,
  },
};

/** With default value - verifies pre-selected value shows and can be changed */
export const WithDefaultValue: Story = {
  args: {
    label: 'Favorite fruit',
    defaultValue: 'banana',
    options: fruitOptions,
    testId: 'default-select',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show the default value
    const trigger = canvas.getByTestId('default-select');
    await expect(trigger).toHaveTextContent('Banana');

    // Change selection to Mango
    await userEvent.click(trigger);
    const option = within(document.body).getByRole('option', { name: 'Mango' });
    await userEvent.click(option);

    await expect(trigger).toHaveTextContent('Mango');
  },
};

/** Disabled state */
export const Disabled: Story = {
  args: {
    label: 'Disabled select',
    placeholder: 'Cannot select...',
    options: fruitOptions,
    disabled: true,
  },
};

/** With some disabled options */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Choose a fruit',
    placeholder: 'Select...',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana (Out of stock)', disabled: true },
      { value: 'orange', label: 'Orange' },
      { value: 'mango', label: 'Mango (Out of stock)', disabled: true },
      { value: 'strawberry', label: 'Strawberry' },
    ],
  },
};

/** Long list of options */
export const LongList: Story = {
  args: {
    label: 'Select a country',
    placeholder: 'Choose...',
    options: countryOptions,
  },
};

/** Required field */
export const Required: Story = {
  args: {
    label: 'Country (required)',
    placeholder: 'Select your country...',
    options: countryOptions,
    required: true,
  },
};

/** Controlled component */
const ControlledExample = () => {
  const [value, setValue] = useState<string>('');

  return (
    <div className="space-y-4">
      <Select
        label="Controlled select"
        placeholder="Select..."
        options={fruitOptions}
        value={value}
        onSelectionChange={setValue}
      />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Selected value: <span className="font-mono">{value || 'none'}</span>
      </div>
      <button
        onClick={() => setValue('orange')}
        className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
      >
        Set to Orange
      </button>
    </div>
  );
};

export const Controlled: Story = {
  args: {
    label: 'Controlled select',
    placeholder: 'Select...',
    options: fruitOptions,
  },
  render: () => <ControlledExample />,
};

/** With change handler */
const WithChangeHandlerExample = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  return (
    <div className="space-y-4">
      <Select
        label="Choose a fruit"
        placeholder="Select..."
        options={fruitOptions}
        onSelectionChange={(value) => {
          setSelectedValue(value);
          console.log('Selected:', value);
        }}
      />
      {selectedValue && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-900 dark:text-green-100">
            You selected: <strong>{selectedValue}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export const WithChangeHandler: Story = {
  args: {
    label: 'Choose a fruit',
    placeholder: 'Select...',
    options: fruitOptions,
  },
  render: () => <WithChangeHandlerExample />,
};

/** Multiple selects in a form */
export const FormExample: Story = {
  args: {
    label: 'Form example',
    options: fruitOptions,
  },
  render: () => {
    return (
      <form className="space-y-4 w-80">
        <Select
          label="First name"
          placeholder="Choose..."
          options={[
            { value: 'john', label: 'John' },
            { value: 'jane', label: 'Jane' },
            { value: 'bob', label: 'Bob' },
          ]}
          required
        />
        <Select
          label="Country"
          placeholder="Select your country..."
          options={countryOptions}
          required
        />
        <Select
          label="Favorite fruit"
          placeholder="Optional selection..."
          options={fruitOptions}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Submit
        </button>
      </form>
    );
  },
};

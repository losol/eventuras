import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SearchField } from './SearchField';

const meta: Meta<typeof SearchField> = {
  title: 'Forms/SearchField',
  component: SearchField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible search field with built-in debouncing (300ms default) and clear button. Built on react-aria-components.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic usage */
export const Basic: Story = {
  render: () => (
    <SearchField
      placeholder="Search..."
      aria-label="Search"
    />
  ),
};

/** With custom placeholder */
export const WithPlaceholder: Story = {
  render: () => (
    <SearchField
      placeholder="Type event name"
      aria-label="Find events"
      className="w-full"
    />
  ),
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <SearchField
      placeholder="Search..."
      aria-label="Search"
      isDisabled
    />
  ),
};

/** Controlled value */
const ControlledExample = () => {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-2">
      <SearchField
        value={value}
        onChange={setValue}
        placeholder="Search..."
        aria-label="Search"
      />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current value: <span className="font-medium">{value || 'empty'}</span>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

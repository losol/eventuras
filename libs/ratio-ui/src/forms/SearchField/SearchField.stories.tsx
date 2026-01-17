import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SearchField } from './SearchField';
import { Label } from '../common/Label';
import { Input } from '../Input/Input';

const meta: Meta<typeof SearchField> = {
  title: 'Forms/SearchField',
  component: SearchField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible search field built on react-aria-components. Use with ratio-ui Label and Input for consistent styling.',
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
    <SearchField>
      <Label>Search</Label>
      <Input placeholder="Search..." />
    </SearchField>
  ),
};

/** With placeholder and custom width */
export const WithPlaceholder: Story = {
  render: () => (
    <SearchField className="flex flex-col gap-1">
      <Label>Find events</Label>
      <Input placeholder="Type event name" />
    </SearchField>
  ),
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <SearchField isDisabled>
      <Label>Search</Label>
      <Input placeholder="Search..." />
    </SearchField>
  ),
};

/** Controlled value */
const ControlledExample = () => {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-2">
      <SearchField value={value} onChange={setValue}>
        <Label>Search</Label>
        <Input placeholder="Search..." />
      </SearchField>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current value: <span className="font-medium">{value || 'empty'}</span>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

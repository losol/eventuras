import type { Meta, StoryObj } from '@storybook/react';
import React, { useMemo, useState } from 'react';
import type { Key, Selection } from 'react-aria-components';
import { ListBox, ListBoxItem } from './ListBox';

const meta: Meta<typeof ListBox> = {
  title: 'Forms/ListBox',
  component: ListBox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible listbox built on react-aria-components. Provides keyboard navigation, selection management, and focus handling.',
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

const fruitItems = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'orange', label: 'Orange' },
  { id: 'mango', label: 'Mango' },
];

const getSelectedKey = (selection: Selection): Key | null => {
  if (selection === 'all') {
    return null;
  }

  const [first] = selection;
  return first ?? null;
};

/** Basic usage */
export const Basic: Story = {
  render: () => (
    <ListBox aria-label="Fruit list">
      {fruitItems.map(item => (
        <ListBoxItem key={item.id} id={item.id} textValue={item.label}>
          {item.label}
        </ListBoxItem>
      ))}
    </ListBox>
  ),
};

/** With disabled option */
export const WithDisabledOption: Story = {
  render: () => (
    <ListBox aria-label="Fruit list">
      {fruitItems.map(item => (
        <ListBoxItem
          key={item.id}
          id={item.id}
          textValue={item.label}
          isDisabled={item.id === 'banana'}
        >
          {item.label}
        </ListBoxItem>
      ))}
    </ListBox>
  ),
};

/** Controlled selection */
const ControlledExample = () => {
  const [selectedKey, setSelectedKey] = useState<Key | null>('apple');
  const selectedKeys = useMemo(() => (selectedKey ? [selectedKey] : []), [selectedKey]);

  return (
    <div className="space-y-3">
      <ListBox
        aria-label="Fruit list"
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={(selection) => {
          setSelectedKey(getSelectedKey(selection));
        }}
      >
        {fruitItems.map(item => (
          <ListBoxItem key={item.id} id={item.id} textValue={item.label}>
            {item.label}
          </ListBoxItem>
        ))}
      </ListBox>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Selected: <span className="font-medium">{selectedKey ?? 'none'}</span>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

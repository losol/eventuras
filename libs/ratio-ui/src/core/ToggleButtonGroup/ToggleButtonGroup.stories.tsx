import { Meta, StoryFn } from '@storybook/react-vite';
import { ToggleButtonGroup, ToggleButtonGroupProps } from './ToggleButtonGroup';
import { useState } from 'react';

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
  tags: ['autodocs'],
};

export default meta;

type ToggleButtonGroupStory = StoryFn<ToggleButtonGroupProps>;

export const Playground: ToggleButtonGroupStory = () => {
  const [value, setValue] = useState<string | null>('option1');

  return (
    <ToggleButtonGroup
      aria-label="Select option"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

export const WithCounts: ToggleButtonGroupStory = () => {
  const [value, setValue] = useState<string | null>('all');

  return (
    <ToggleButtonGroup
      aria-label="Filter items"
      options={[
        { value: 'all', label: 'All', count: 42 },
        { value: 'active', label: 'Active', count: 28 },
        { value: 'inactive', label: 'Inactive', count: 14 },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

export const StatusFilter: ToggleButtonGroupStory = () => {
  const [value, setValue] = useState<string | null>('pending');

  return (
    <ToggleButtonGroup
      aria-label="Filter by status"
      options={[
        { value: 'pending', label: 'Pending', count: 5 },
        { value: 'approved', label: 'Approved', count: 23 },
        { value: 'rejected', label: 'Rejected', count: 2 },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

export const ViewModes: ToggleButtonGroupStory = () => {
  const [value, setValue] = useState<string | null>('grid');

  return (
    <ToggleButtonGroup
      aria-label="Select view mode"
      options={[
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
        { value: 'table', label: 'Table' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

export const ManyOptions: ToggleButtonGroupStory = () => {
  const [value, setValue] = useState<string | null>('month');

  return (
    <ToggleButtonGroup
      aria-label="Select time period"
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'quarter', label: 'Quarter' },
        { value: 'year', label: 'Year' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

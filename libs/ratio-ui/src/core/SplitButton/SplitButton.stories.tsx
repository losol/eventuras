import { Meta, StoryFn } from '@storybook/react-vite';
import { Download, Send, Trash2, Pencil } from '../../icons';
import { fn } from 'storybook/test';

import { SplitButton, SplitButtonProps } from './SplitButton';

const meta: Meta<typeof SplitButton> = {
  component: SplitButton,
  title: 'Core/SplitButton',
  tags: ['autodocs'],
  args: {
    variant: 'outline',
    size: 'md',
    disabled: false,
    loading: false,
    children: 'Primary Action',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'light', 'text'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;

type SplitButtonStory = StoryFn<SplitButtonProps>;

const Template: SplitButtonStory = (args) => <SplitButton {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  children: 'Download',
  icon: <Download className="w-4 h-4" />,
  actions: [
    { id: 'send', label: 'Send to email', onClick: fn(), icon: <Send className="w-4 h-4" /> },
    { id: 'delete', label: 'Delete', onClick: fn(), icon: <Trash2 className="w-4 h-4" /> },
  ],
};

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Save',
  actions: [
    { id: 'save-draft', label: 'Save as draft', onClick: fn() },
    { id: 'save-publish', label: 'Save and publish', onClick: fn() },
  ],
};

export const WithIcons = Template.bind({});
WithIcons.args = {
  variant: 'outline',
  children: 'Download certificate',
  icon: <Download className="w-4 h-4" />,
  actions: [
    { id: 'send', label: 'Send to participant', onClick: fn(), icon: <Send className="w-4 h-4" /> },
  ],
};

export const SmallSize = Template.bind({});
SmallSize.args = {
  size: 'sm',
  children: 'Actions',
  actions: [
    { id: 'edit', label: 'Edit', onClick: fn(), icon: <Pencil className="w-4 h-4" /> },
    { id: 'delete', label: 'Delete', onClick: fn(), icon: <Trash2 className="w-4 h-4" /> },
  ],
};

export const LargeSize = Template.bind({});
LargeSize.args = {
  size: 'lg',
  children: 'Export',
  icon: <Download className="w-5 h-5" />,
  actions: [
    { id: 'excel', label: 'Export as Excel', onClick: fn() },
    { id: 'pdf', label: 'Export as PDF', onClick: fn() },
    { id: 'csv', label: 'Export as CSV', onClick: fn() },
  ],
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
  children: 'Processing...',
  actions: [
    { id: 'action', label: 'Other action', onClick: fn() },
  ],
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  children: 'Disabled',
  actions: [
    { id: 'action', label: 'Other action', onClick: fn() },
  ],
};

export const AllVariants = () => {
  const variants: SplitButtonProps['variant'][] = [
    'primary',
    'secondary',
    'outline',
    'light',
    'text',
  ];

  const actions = [
    { id: 'action1', label: 'Action 1', onClick: fn() },
    { id: 'action2', label: 'Action 2', onClick: fn() },
  ];

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">{variant}</span>
          <SplitButton
            variant={variant}
            onClick={fn()}
            actions={actions}
          >
            {variant}
          </SplitButton>
        </div>
      ))}
    </div>
  );
};
AllVariants.storyName = 'All Variants';

export const AllSizes = () => {
  const sizes: SplitButtonProps['size'][] = ['sm', 'md', 'lg'];

  const actions = [
    { id: 'action1', label: 'Action 1', onClick: fn() },
  ];

  return (
    <div className="space-y-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-16 text-sm font-medium">{size}</span>
          <SplitButton
            size={size}
            onClick={fn()}
            actions={actions}
            icon={<Download className="w-4 h-4" />}
          >
            Size {size}
          </SplitButton>
        </div>
      ))}
    </div>
  );
};
AllSizes.storyName = 'All Sizes';

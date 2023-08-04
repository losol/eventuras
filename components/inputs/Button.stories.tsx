import type { Meta, StoryObj } from '@storybook/react';

import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    primary: true,
    // label: 'Button',
  },
  render: args => <Button {...args}>Button</Button>,
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    primary: false,
  },
};

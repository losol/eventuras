import type { Meta, StoryObj } from '@storybook/react';

import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Filled: Story = {
  args: {
    variant: 'filled',
  },
  render: args => <Button {...args}>Tap Me If You Dare!</Button>,
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: args => <Button {...args}>Outline This!</Button>,
};

export const Light: Story = {
  args: {
    variant: 'light',
  },
  render: args => <Button {...args}>Feather-Light Tap!</Button>,
};

export const Transparent: Story = {
  args: {
    variant: 'transparent',
  },
  render: args => <Button {...args}>Shy, But Clickable!</Button>,
};

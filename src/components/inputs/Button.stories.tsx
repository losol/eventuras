import type { Meta, StoryObj } from '@storybook/react';

import { buttonStyles } from './Button';
import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Filled: Story = {
  args: {
    className: `${buttonStyles.base} ${buttonStyles.primary}`,
  },
  render: args => <Button {...args}>Tap Me If You Dare!</Button>,
};

export const Outline: Story = {
  args: {
    className: `${buttonStyles.base} ${buttonStyles.secondary}`,
  },
  render: args => <Button {...args}>Outline This!</Button>,
};

export const Light: Story = {
  args: {
    className: `${buttonStyles.base} ${buttonStyles.light}`,
  },
  render: args => <Button {...args}>Feather-Light Tap!</Button>,
};

export const Transparent: Story = {
  args: {
    className: `${buttonStyles.base} ${buttonStyles.transparent}`,
  },
  render: args => <Button {...args}>Shy, But Clickable!</Button>,
};

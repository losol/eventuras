import type { Meta, StoryObj } from '@storybook/react';

import Card from './Card';

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {},
  render: () => (
    <Card>
      <Card.Heading>Really nice card</Card.Heading>
      <Card.Text>Some really nice words. Should not be too long, I think</Card.Text>
    </Card>
  ),
};

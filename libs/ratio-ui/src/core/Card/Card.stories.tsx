

import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardProps } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    dark: { control: 'boolean' },
    container: { control: 'boolean' },
    backgroundColorClass: { control: 'text' },
    backgroundImageUrl: { control: 'text' },
    padding: { control: 'text' },
    margin: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'This is a default card.',
  },
};

export const Dark: Story = {
  args: {
    dark: true,
    children: 'This is a dark card.',
    backgroundColorClass: 'bg-slate-800',
  },
};

export const WithContainer: Story = {
  args: {
    container: true,
    children: 'This card wraps its children in a Container component.',
  },
};

export const WithBackgroundImage: Story = {
  args: {
    backgroundImageUrl: 'https://via.placeholder.com/400x200',
    children: 'Card with a background image.',
  },
};

export const CustomPaddingAndMargin: Story = {
  args: {
    padding: '8',
    margin: '4',
    children: 'Card with custom padding and margin.',
  },
};

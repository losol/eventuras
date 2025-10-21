import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Section, SectionProps } from './Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    container: { control: 'boolean' },
    backgroundColorClass: { control: 'text' },
    backgroundImageUrl: { control: 'text' },
    padding: { control: 'text' },
    margin: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    children: 'This is a default section.',
  },
};

export const WithContainer: Story = {
  args: {
    container: true,
    children: 'This section wraps its children in a Container component.',
  },
};

export const WithBackgroundColor: Story = {
  args: {
    backgroundColorClass: 'bg-gray-100',
    padding: 'py-12',
    children: 'Section with background color and vertical padding.',
  },
};

export const WithBottomPadding: Story = {
  args: {
    className: 'pb-24',
    children: 'Section with large bottom padding (pb-24).',
  },
};

export const WithBackgroundImage: Story = {
  args: {
    backgroundImageUrl: 'https://via.placeholder.com/1200x400',
    padding: 'py-24',
    children: 'Section with a background image.',
  },
};

export const CustomSpacing: Story = {
  args: {
    padding: 'py-16 px-8',
    margin: 'my-8',
    children: 'Section with custom padding and margin.',
  },
};

export const FullWidthColored: Story = {
  args: {
    backgroundColorClass: 'bg-primary-100',
    padding: 'py-20',
    container: true,
    children: 'Full-width colored section with centered content container.',
  },
};

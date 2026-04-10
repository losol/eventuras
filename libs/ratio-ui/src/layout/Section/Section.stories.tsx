import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './Section';
import { Box } from '../Box';
import { Container } from '../Container';
import { Heading } from '../../core/Heading';
import { Button } from '../../core/Button';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    },
    backgroundImageUrl: { control: 'text' },
    padding: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    paddingX: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    paddingY: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    margin: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    marginY: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
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
  render: () => (
    <Section>
      <Container>This section wraps its children in a Container component.</Container>
    </Section>
  ),
};

export const WithColor: Story = {
  args: {
    color: 'primary',
    paddingY: 'xl',
    children: 'Section with semantic color.',
  },
};

export const WithBackgroundImage: Story = {
  args: {
    backgroundImageUrl: 'https://via.placeholder.com/1200x400',
    paddingY: 'xl',
    children: 'Section with a background image.',
  },
};

export const AllColors: Story = {
  render: () => (
    <>
      {(['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'] as const).map(c => (
        <Section key={c} color={c} paddingY="sm">
          <Container>{c}</Container>
        </Section>
      ))}
    </>
  ),
};

export const FullWidthHero: Story = {
  render: () => (
    <Section
      className="bg-linear-to-r from-blue-600 to-purple-600 text-white"
      paddingY="xl"
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Eventuras</h1>
        <p className="text-xl mb-8">Manage your events with ease</p>
        <Button variant="secondary">Get Started</Button>
      </div>
    </Section>
  ),
};

export const GridLayout: Story = {
  render: () => (
    <Section paddingY="xl" className="grid grid-cols-1 md:grid-cols-2" gap="lg">
      <Box>
        <Heading as="h2" marginBottom="sm">Two-column Grid</Heading>
        <p className="text-lg mb-4">
          Use className to apply grid layout directly.
        </p>
      </Box>
      <Box>
        <p className="text-gray-600 dark:text-gray-400">
          On mobile, the columns stack. On desktop, side by side.
        </p>
      </Box>
    </Section>
  ),
};

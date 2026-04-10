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
    backgroundColorClass: { control: 'text' },
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

export const WithBackgroundColor: Story = {
  args: {
    backgroundColorClass: 'bg-gray-100',
    paddingY: 'xl',
    children: 'Section with background color and vertical padding.',
  },
};

export const WithBackgroundImage: Story = {
  args: {
    backgroundImageUrl: 'https://via.placeholder.com/1200x400',
    paddingY: 'xl',
    children: 'Section with a background image.',
  },
};

export const CustomSpacing: Story = {
  args: {
    paddingY: 'xl',
    paddingX: 'xl',
    marginY: 'lg',
    children: 'Section with custom padding and margin.',
  },
};

export const FullWidthColored: Story = {
  render: () => (
    <Section backgroundColorClass="bg-primary-100" paddingY="xl">
      <Container>Full-width colored section with centered content container.</Container>
    </Section>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <>
      <Section className="bg-gray-50 dark:bg-gray-900" paddingY="lg">
        <Container>
          <h2 className="text-2xl font-bold mb-4">First Section</h2>
          <p>Content for the first section.</p>
        </Container>
      </Section>
      <Section className="bg-white dark:bg-gray-800" paddingY="lg">
        <Container>
          <h2 className="text-2xl font-bold mb-4">Second Section</h2>
          <p>Content for the second section.</p>
        </Container>
      </Section>
      <Section className="bg-gray-50 dark:bg-gray-900" paddingY="lg">
        <Container>
          <h2 className="text-2xl font-bold mb-4">Third Section</h2>
          <p>Content for the third section.</p>
        </Container>
      </Section>
    </>
  ),
};

export const FullWidthHero: Story = {
  render: () => (
    <Section
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
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
          On mobile, the columns stack vertically. On desktop, they appear side by side.
        </p>
      </Box>
    </Section>
  ),
};

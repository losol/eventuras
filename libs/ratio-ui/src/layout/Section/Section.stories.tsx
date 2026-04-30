import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './Section';
import { Box } from '../Box';
import { Container } from '../Container';
import { Heading } from '../../core/Heading';
import { Button } from '../../core/Button';
import { buildCoverImageStyle } from '../../utils/buildCoverImageStyle';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    },
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
  render: () => (
    <Section
      style={buildCoverImageStyle('https://via.placeholder.com/1200x400')}
      paddingY="xl"
      className="text-white"
    >
      Section with a background image.
    </Section>
  ),
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
      dark
      className="bg-linear-to-r from-blue-600 to-purple-600"
      paddingY="xl"
    >
      <Container>
        <Heading as="h1" marginBottom="sm">
          Welcome to Eventuras
        </Heading>
        <p className="text-xl mb-8">Manage your events with ease</p>
        <Button variant="secondary">Get Started</Button>
      </Container>
    </Section>
  ),
};

/**
 * `dark` declares the section as a dark-toned surface so child components
 * (Heading, Button text/outline variants, Link, …) read the right `--text`
 * color automatically — no per-component overrides needed.
 */
export const DarkSurface: Story = {
  render: () => (
    <Section dark className="bg-slate-900" paddingY="xl">
      <Container>
        <Heading as="h2" marginBottom="sm">
          Dark surface section
        </Heading>
        <p className="mb-4">
          The Heading and this paragraph both inherit `var(--text)`, which is
          pinned to a light value inside <code>{'<Section dark>'}</code>.
        </p>
        <Button variant="outline">Outline button</Button>
      </Container>
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

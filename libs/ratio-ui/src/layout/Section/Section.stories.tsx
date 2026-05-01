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
 * Layer a brand-tinted animated gradient behind a section by adding
 * `surface-animated` to its className. Pairs well with hero/landing
 * sections; reserve for one accent area per page.
 */
export const AnimatedSurface: Story = {
  render: () => (
    <Section className="surface-animated" paddingY="xl">
      <Container>
        <Heading as="h2" marginBottom="sm">Animated surface</Heading>
        <p className="mb-4 max-w-prose">
          Brand-tinted gradient blobs drift slowly behind the content. The
          palette uses semantic <code>--primary</code>, <code>--accent</code>,
          and <code>--secondary</code> tokens, so it follows the active theme.
        </p>
        <Button variant="primary">Get started</Button>
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

/**
 * Editorial section header — eyebrow + serif title with optional italic
 * accent. Use when you want a quietly-marked content section to stand
 * apart from neighboring sections without competing with the page hero.
 */
export const WithHeader: Story = {
  render: () => (
    <Section paddingY="lg">
      <Container>
        <Section.Header>
          <Section.Eyebrow>Lær på din egen tid</Section.Eyebrow>
          <Section.Title>
            Self-paced <em className="font-serif text-(--primary)">study</em> tracks
          </Section.Title>
        </Section.Header>
        <p className="text-(--text-muted) max-w-prose">
          Each track is a curated reading list with notes and exercises — go through them in
          order, or jump in wherever your curiosity takes you.
        </p>
      </Container>
    </Section>
  ),
};

/**
 * Section header with a CTA link. `Section.Link` is auto-detected and
 * pushed to the right side of the header row; everything else stacks on
 * the left. The arrow nudges on hover.
 */
export const WithHeaderAndLink: Story = {
  render: () => (
    <Section paddingY="lg">
      <Container>
        <Section.Header>
          <Section.Eyebrow>Kommende</Section.Eyebrow>
          <Section.Title>
            All <em className="font-serif text-(--primary)">articles</em>, in chronological order
          </Section.Title>
          <Section.Link href="#">Filter and search</Section.Link>
        </Section.Header>
        <p className="text-(--text-muted)">
          The full archive — newest first. Use the filter for tags, authors, or date range.
        </p>
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

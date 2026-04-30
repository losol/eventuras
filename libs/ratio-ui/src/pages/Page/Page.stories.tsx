import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Button } from '../../core/Button';
import { Footer } from '../../core/Footer/Footer';
import { Heading } from '../../core/Heading';
import { List } from '../../core/List/List';
import { Navbar } from '../../core/Navbar/Navbar';
import { Container } from '../../layout/Container';
import { Section } from '../../layout/Section/Section';

const PageDemo: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar sticky>
      <Navbar.Brand>
        <a href="/" className="text-lg tracking-tight whitespace-nowrap no-underline">
          {title}
        </a>
      </Navbar.Brand>
      <Navbar.Content className="justify-end">
        <a href="#about" className="hover:underline">About</a>
        <a href="#features" className="hover:underline">Features</a>
        <Button variant="primary">Sign in</Button>
      </Navbar.Content>
    </Navbar>

    <main className="flex-1">
      {/* Editorial hero — Linseed-toned title with italic accents and a stat panel on the right */}
      <Section paddingY="xl">
        <Container>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--accent) font-bold mb-5">
                Knowledge platform · Sentence case is the norm
              </p>
              <Heading as="h1" className="font-serif font-normal !text-5xl lg:!text-6xl !leading-[1.05] !tracking-tight">
                Find knowledge —{' '}
                <em className="not-italic font-serif italic text-(--primary)">considered</em>,{' '}
                <em className="not-italic font-serif italic text-(--accent)">measured</em>,
                ours.
              </Heading>
              <p className="text-lg max-w-[44ch] text-(--text-muted) mt-6">
                A design system built on clarity, proportion, and composable components. Use it
                to build event sites, knowledge bases, and editorial surfaces that hold up under
                use.
              </p>
              <div className="flex gap-3 flex-wrap mt-8">
                <Button variant="primary" size="lg">Get started</Button>
                <Button variant="outline" size="lg">Read the source</Button>
              </div>
            </div>

            {/* Stat panel — divider on the left, three numbers, serif italic accent */}
            <div className="border-l border-(--border-2) pl-10 grid gap-7 hidden lg:grid">
              <div>
                <div className="font-serif text-4xl leading-none text-(--primary) tracking-tight">
                  <em className="not-italic italic text-(--accent)">11</em>-step scales
                </div>
                <div className="text-sm text-(--text-muted) mt-1.5">
                  Linseed, Linen, Ochre — three voices, eleven stops each
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl leading-none text-(--primary) tracking-tight">
                  2 <em className="not-italic italic text-(--accent)">families</em>
                </div>
                <div className="text-sm text-(--text-muted) mt-1.5">
                  Source Serif 4 + Source Sans 3, self-hosted
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl leading-none text-(--primary) tracking-tight">
                  1 <em className="not-italic italic text-(--accent)">surface</em>
                </div>
                <div className="text-sm text-(--text-muted) mt-1.5">
                  Linen-200 by default, Linseed-950 in dark mode
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Three-up feature cards — neutral surface */}
      <Section paddingY="lg" color="neutral" id="features">
        <Container>
          <Section.Header>
            <Section.Eyebrow>The library</Section.Eyebrow>
            <Section.Title>
              What's <em className="font-serif text-(--primary)">inside</em>
            </Section.Title>
            <Section.Link href="#">Browse all components</Section.Link>
          </Section.Header>
          <p className="text-(--text-muted) max-w-[60ch] mb-10">
            Tokens, primitives, and patterns ready to compose. Every piece is documented in
            Storybook with the source you actually ship.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-(--border-1) bg-(--card)">
              <Heading as="h4" className="!mb-2">Tokens</Heading>
              <p className="text-sm text-(--text-muted)">
                Color scales, typography, spacing, borders, status — all theme-aware via CSS
                variables.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-(--border-1) bg-(--card)">
              <Heading as="h4" className="!mb-2">Primitives</Heading>
              <p className="text-sm text-(--text-muted)">
                Dialog, Drawer, Navbar, Footer — built on React Aria for keyboard and screen
                reader support.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-(--border-1) bg-(--card)">
              <Heading as="h4" className="!mb-2">Patterns</Heading>
              <p className="text-sm text-(--text-muted)">
                Compound APIs (Heading, Content, Footer slots) for the shapes that show up over
                and over.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Dark surface CTA — shows the surface-token system in action */}
      <Section dark paddingY="xl" className="bg-(--color-primary-900)">
        <Container className="text-center">
          <Heading as="h2" className="!mb-3">
            Built for content that <em className="not-italic font-serif italic text-(--accent)">lasts</em>
          </Heading>
          <p className="max-w-[56ch] mx-auto mb-8 text-(--text-muted)">
            The system is open source, MIT licensed, and shipped from the same monorepo as
            Eventuras itself. No build step required, just install and import.
          </p>
          <Button variant="primary" size="lg">View on GitHub</Button>
        </Container>
      </Section>
    </main>

    <Footer.Classic siteTitle={title}>
      <List>
        <List.Item className="mb-2"><a href="/">Home</a></List.Item>
        <List.Item className="mb-2"><a href="/docs">Documentation</a></List.Item>
        <List.Item className="mb-2"><a href="/privacy">Privacy</a></List.Item>
      </List>
    </Footer.Classic>
  </div>
);

const meta = {
  title: 'Pages/Page Demo',
  component: PageDemo,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Ratio UI' },
} satisfies Meta<typeof PageDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

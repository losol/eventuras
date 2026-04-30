import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Navbar } from '../../core/Navbar/Navbar';
import { Footer } from '../../core/Footer/Footer';
import { List } from '../../core/List/List';
import { Section } from '../../layout/Section/Section';
import { Container } from '../../layout/Container';
import { Button } from '../../core/Button';

const PageDemo: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar bgColor="bg-transparent w-full py-1">
      <Navbar.Brand>
        <a href="/" className="text-lg tracking-tight whitespace-nowrap no-underline">
          {title}
        </a>
      </Navbar.Brand>
      <Navbar.Content className="justify-end">
        <a href="#hero" className="hover:underline">Home</a>
        <a href="#features" className="hover:underline">Features</a>
      </Navbar.Content>
    </Navbar>

    <main className="flex-1">
      <Section
        paddingY="xl"
        className="bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b"
      >
        <Container>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find knowledge. Fast.</h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Search across spaces, pages, discussions and files.
          </p>
          <Button variant="primary">Get Started</Button>
        </Container>
      </Section>

      <Section paddingY="lg">
        <Container>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Spaces keep teams aligned</h2>
              <p>Organize knowledge by domain. Govern access, templates, and review cycles.</p>
            </div>
            <img src="https://placehold.co/800x500/png" alt="Spaces" className="w-full rounded shadow" />
          </div>
        </Container>
      </Section>

      <Section paddingY="lg" color="neutral">
        <Container>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded border">
              <h4 className="font-semibold mb-2">Verification</h4>
              <p>Verified badge with expiry and review reminders.</p>
            </div>
            <div className="p-5 rounded border">
              <h4 className="font-semibold mb-2">Permissions</h4>
              <p>Space-level roles with full audit trail.</p>
            </div>
            <div className="p-5 rounded border">
              <h4 className="font-semibold mb-2">AI Assist</h4>
              <p>Answers from verified sources only.</p>
            </div>
          </div>
        </Container>
      </Section>
    </main>

    <Footer.Classic siteTitle={title}>
      <List>
        <List.Item className="mb-2"><a href="/">Home</a></List.Item>
        <List.Item className="mb-2"><a href="/privacy">Privacy</a></List.Item>
      </List>
    </Footer.Classic>
  </div>
);

const meta = {
  title: 'Pages/Page Demo',
  component: PageDemo,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Eventuras' },
} satisfies Meta<typeof PageDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

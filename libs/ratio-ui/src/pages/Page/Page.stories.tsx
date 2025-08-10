import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Navbar } from '../../core/Navbar/Navbar';
import { Footer } from '../../core/Footer/Footer';
import { List } from '../../core/List/List';
import { Section } from '../../layout/Section/Section';

/** Minimal link shim so Storybook doesn't depend on next/link */
const AnchorLink = ({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

type PageDemoProps = {
  title: string;
  imageNavbar?: boolean;
  bgDark?: boolean;
  fluid?: boolean;
};

const PageDemo: React.FC<PageDemoProps> = ({
  title,
  imageNavbar,
  bgDark,
  fluid,
}) => {
  // Mirror Wrapper-like defaults
  const bgClass = imageNavbar
    ? 'bg-transparent z-10 absolute w-full py-1'
    : 'bg-transparent w-full py-1';
  const containerFlag = !fluid;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title={title} bgColor={bgClass} bgDark={bgDark} LinkComponent={AnchorLink}>
        <nav className="flex gap-4 ml-auto">
          <a href="#search" className="hover:underline">Search</a>
          <a href="#spaces" className="hover:underline">Spaces</a>
          <a href="#collections" className="hover:underline">Collections</a>
          <a href="#recent" className="hover:underline">Recent</a>
        </nav>
      </Navbar>

      <main id="main-content" className="flex-1">
        {/* Hero / global search */}
        <Section
          id="search"
          container={containerFlag}
          padding="py-16 md:py-24"
          backgroundColorClass="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
          className="border-b"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find knowledge. Fast.</h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Search across spaces, pages, discussions and files. Verified sources. Instant answers.
          </p>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              placeholder="Search company knowledge (⌘K)"
              className="flex-1 px-4 py-3 rounded border"
              aria-label="Global knowledge search"
            />
            <button className="px-5 py-3 rounded bg-blue-600 text-white">Search</button>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Try: <button className="underline">“How do we deploy to prod?”</button>{' '}
            <button className="underline">“DPIA checklist”</button>{' '}
            <button className="underline">“PKI funding template”</button>
          </div>
        </Section>

        {/* Spaces overview (image + text) */}
        <Section
          id="spaces"
          container={containerFlag}
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="https://placehold.co/800x500/png"
              alt="Spaces overview"
              className="w-full h-auto rounded shadow"
            />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Spaces keep teams aligned</h2>
              <p className="mb-4">
                Organize knowledge by domain: Product, Engineering, Clinical, Compliance.
                Govern access, templates, and review cycles per space.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Owners & roles with audit trail</li>
                <li>Page templates (RCA, ADR, SOP)</li>
                <li>Lifecycle rules (review every 90 days)</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Collections & Citations (text + image) */}
        <Section
          id="collections"
          container={containerFlag}
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Collections & citations</h3>
              <p className="mb-4">
                Bundle related docs into collections, cite sources inline, and export to PDF/Word.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Inline references with backlinks</li>
                <li>Auto-generated bibliography</li>
                <li>Reader mode with highlights</li>
              </ul>
              <div className="mt-6">
                <button className="px-4 py-2 rounded bg-blue-600 text-white">Create collection</button>
              </div>
            </div>
            <img
              src="https://placehold.co/800x500/png"
              alt="Collections and citations"
              className="w-full h-auto rounded shadow"
            />
          </div>
        </Section>

        {/* Recently updated & quick links */}
        <Section
          id="recent"
          container={containerFlag}
        >
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-semibold mb-4">Recently updated</h3>
              <ul className="space-y-3">
                <li className="p-3 rounded border">
                  <div className="font-medium">DPIA – Critical Info API</div>
                  <div className="text-sm text-gray-500">Edited by Anna • 2 hours ago • Compliance</div>
                </li>
                <li className="p-3 rounded border">
                  <div className="font-medium">ADR-019: Auth flow refactor</div>
                  <div className="text-sm text-gray-500">Edited by Omar • Yesterday • Engineering</div>
                </li>
                <li className="p-3 rounded border">
                  <div className="font-medium">PKI funding application template</div>
                  <div className="text-sm text-gray-500">Edited by Kari • 3 days ago • Product</div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick links</h3>
              <div className="grid grid-cols-2 gap-3">
                <a className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800" href="#!">SOPs</a>
                <a className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800" href="#!">Runbooks</a>
                <a className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800" href="#!">Regulatory</a>
                <a className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800" href="#!">Architecture</a>
              </div>
            </div>
          </div>
        </Section>

        {/* Governance callout */}
        <Section
          id="governance"
          container={containerFlag}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded border">
              <h4 className="font-semibold mb-2">Verification</h4>
              <p>“Verified” badge with expiry; reviewers get reminders before content goes stale.</p>
            </div>
            <div className="p-5 rounded border">
              <h4 className="font-semibold mb-2">Permissions</h4>
              <p>Space-level roles and page-level exceptions with full audit trail.</p>
            </div>
            <div className="p-5 rounded border">
              <h4 className="font-semibold mb-2">AI Assist</h4>
              <p>Answer with citations from verified sources only; redact sensitive fields.</p>
            </div>
          </div>
        </Section>
      </main>

      <Footer siteTitle={title}>
        <List>
          <List.Item className="mb-2"><a href="/">Home</a></List.Item>
          <List.Item className="mb-2"><a href="/privacy">Privacy</a></List.Item>
          <List.Item className="mb-2"><a href="/terms">Terms</a></List.Item>
        </List>
      </Footer>
    </div>
  );
};

const meta = {
  title: 'Pages/Page Demo',
  component: PageDemo,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text' },
    imageNavbar: { control: 'boolean' },
    bgDark: { control: 'boolean' },
    fluid: { control: 'boolean' },
  },
  args: {
    title: 'Eventuras Knowledge',
    imageNavbar: false,
    bgDark: false,
    fluid: false,
  },
} satisfies Meta<typeof PageDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ImageNavbar: Story = { args: { imageNavbar: true } };
export const DarkNavbar: Story = { args: { bgDark: true } };
export const FluidMain: Story = { args: { fluid: true } };

import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { TreeView, TreeViewProps, TreeViewNode } from './TreeView';

const sampleTree: TreeViewNode[] = [
  { title: 'Getting Started', href: '/docs/getting-started' },
  {
    title: 'Developer',
    children: [
      { title: 'Configuration', href: '/docs/developer/configuration' },
      { title: 'Email', href: '/docs/developer/email' },
      { title: 'Migrations', href: '/docs/developer/migrations' },
      {
        title: 'Business Logic',
        children: [
          { title: 'Event Registration', href: '/docs/developer/business-logic/event-registration' },
          { title: 'Order Management', href: '/docs/developer/business-logic/order-management' },
        ],
      },
    ],
  },
  {
    title: 'Libraries',
    children: [
      { title: 'ratio-ui', href: '/docs/libraries/ratio-ui' },
      { title: 'markdown', href: '/docs/libraries/markdown' },
      { title: 'lustro-search', href: '/docs/libraries/lustro-search' },
    ],
  },
  { title: 'Contributing', href: '/docs/contributing' },
];

const StoryLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a
    href={href}
    className={className}
    onClick={(e) => {
      e.preventDefault();
      console.log('navigate', href);
    }}
  >
    {children}
  </a>
);

const meta: Meta<TreeViewProps> = {
  title: 'Core/TreeView',
  component: TreeView,
  decorators: [
    (Story) => (
      <div style={{ width: 256, padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<TreeViewProps>;

export const Default: Story = {
  args: {
    tree: sampleTree,
    LinkComponent: StoryLink,
  },
};

export const WithActivePage: Story = {
  args: {
    tree: sampleTree,
    currentPath: '/docs/developer/email',
    LinkComponent: StoryLink,
  },
};

export const NestedActive: Story = {
  args: {
    tree: sampleTree,
    currentPath: '/docs/developer/business-logic/order-management',
    LinkComponent: StoryLink,
  },
};

export const Collapsed: Story = {
  args: {
    tree: sampleTree,
    currentPath: '/docs/contributing',
    LinkComponent: StoryLink,
  },
};

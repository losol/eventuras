import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { NavList, NavListProps, NavListItem } from './NavList';

const sampleItems: NavListItem[] = [
  { href: '#overview', title: 'Overview' },
  { href: '#features', title: 'Features' },
  { href: '#pricing', title: 'Pricing' },
  { href: '#faq', title: 'FAQ' },
];

const meta: Meta<NavListProps> = {
  title: 'Core/NavList',
  component: NavList,
  argTypes: {
    sticky: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<NavListProps>;

export const Default: Story = {
  args: {
    items: sampleItems,
    LinkComponent: (props) => <a {...props} />,
    sticky: false,
  },
};

export const Sticky: Story = {
  args: {
    items: sampleItems,
    LinkComponent: (props) => <a {...props} />,
    sticky: true,
  },
  render: (args) => (
    <div style={{ height: '200vh' /* make page tall */ }}>
      <NavList {...args} />
      <div style={{ padding: '2rem' }}>
        {/* Dummy sections to scroll through */}
        <section id="overview" style={{ height: '50vh' }}>
          <h2>Overview</h2>
          <p>Lots of content here…</p>
        </section>
        <section id="features" style={{ height: '50vh' }}>
          <h2>Features</h2>
          <p>More content here…</p>
        </section>
        <section id="pricing" style={{ height: '50vh' }}>
          <h2>Pricing</h2>
          <p>Even more content…</p>
        </section>
        <section id="faq" style={{ height: '50vh' }}>
          <h2>FAQ</h2>
          <p>And some final content…</p>
        </section>
      </div>
    </div>
  ),
};

export const Scrollable: Story = {
  args: {
    items: Array.from({ length: 10 }, (_, i) => ({
      href: `#item-${i + 1}`,
      title: `Linkitem ${i + 1}`,
    })),
    LinkComponent: (props) => <a {...props} />,
    sticky: false,
  },
};

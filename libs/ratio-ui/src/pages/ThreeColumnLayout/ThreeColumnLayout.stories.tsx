import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { ThreeColumnLayout, ThreeColumnLayoutProps } from './ThreeColumnLayout';
import { TreeView, TreeViewNode } from '../../core/TreeView/TreeView';
import { TableOfContents, TocHeading } from '../../core/TableOfContents/TableOfContents';

const sidebarTree: TreeViewNode[] = [
  { title: 'Introduction', href: '#' },
  {
    title: 'Getting Started',
    children: [
      { title: 'Installation', href: '#installation' },
      { title: 'Quick Start', href: '#quick-start' },
    ],
  },
  {
    title: 'Core Concepts',
    children: [
      { title: 'Components', href: '#components' },
      { title: 'Theming', href: '#theming' },
      { title: 'Responsive Design', href: '#responsive-design' },
    ],
  },
  {
    title: 'Advanced',
    children: [
      { title: 'Custom Hooks', href: '#custom-hooks' },
      { title: 'Performance', href: '#performance' },
    ],
  },
  { title: 'API Reference', href: '#api-reference' },
  { title: 'FAQ', href: '#faq' },
];

const tocHeadings: TocHeading[] = [
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'prerequisites', text: 'Prerequisites', level: 3 },
  { id: 'package-manager', text: 'Package Manager', level: 3 },
  { id: 'quick-start', text: 'Quick Start', level: 2 },
  { id: 'components', text: 'Components', level: 2 },
  { id: 'button', text: 'Button', level: 3 },
  { id: 'card', text: 'Card', level: 3 },
  { id: 'theming', text: 'Theming', level: 2 },
  { id: 'color-tokens', text: 'Color Tokens', level: 3 },
  { id: 'dark-mode', text: 'Dark Mode', level: 3 },
  { id: 'responsive-design', text: 'Responsive Design', level: 2 },
  { id: 'custom-hooks', text: 'Custom Hooks', level: 2 },
  { id: 'performance', text: 'Performance', level: 2 },
  { id: 'api-reference', text: 'API Reference', level: 2 },
  { id: 'faq', text: 'FAQ', level: 2 },
];

const StoryLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} className={className} onClick={(e) => { e.preventDefault(); console.log('navigate', href); }}>
    {children}
  </a>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="my-4 overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
    <code>{children}</code>
  </pre>
);

const SampleContent = () => (
  <article className="prose">
    <h1>ratio-ui Documentation</h1>
    <p className="text-lg text-gray-600 dark:text-gray-400">
      A comprehensive design system for building modern React applications with Tailwind CSS.
    </p>

    <h2 id="installation">Installation</h2>
    <p>
      Get started by installing ratio-ui and its peer dependencies. The library is designed to work
      seamlessly with Tailwind CSS v4 and React 18+.
    </p>

    <h3 id="prerequisites">Prerequisites</h3>
    <p>Before installing, make sure you have the following:</p>
    <ul>
      <li>Node.js 18 or later</li>
      <li>React 18 or 19</li>
      <li>Tailwind CSS v4</li>
    </ul>

    <h3 id="package-manager">Package Manager</h3>
    <p>Install using your preferred package manager:</p>
    <CodeBlock>pnpm add @eventuras/ratio-ui</CodeBlock>
    <p>Then import the CSS in your root layout:</p>
    <CodeBlock>{`import '@eventuras/ratio-ui/ratio-ui.css';`}</CodeBlock>

    <h2 id="quick-start">Quick Start</h2>
    <p>
      Import components directly from their subpath exports. This enables tree-shaking and keeps
      your bundle size small.
    </p>
    <CodeBlock>{`import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

export function MyPage() {
  return (
    <div>
      <Heading as="h1">Hello World</Heading>
      <Button variant="primary">Get Started</Button>
    </div>
  );
}`}</CodeBlock>

    <h2 id="components">Components</h2>
    <p>
      ratio-ui provides a wide range of components organized into categories: core, layout, forms,
      and commerce.
    </p>

    <h3 id="button">Button</h3>
    <p>
      The Button component supports multiple variants (primary, secondary, light, text) and sizes.
      It is built on top of React Aria for full accessibility.
    </p>
    <CodeBlock>{`<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="text" size="sm">Learn more</Button>`}</CodeBlock>
    <p>
      Buttons support loading states, disabled states, and can render as links when given an href prop.
    </p>

    <h3 id="card">Card</h3>
    <p>
      Cards are container components with optional hover effects, multiple variants (default, wide,
      outline, transparent), and support for click handlers.
    </p>
    <CodeBlock>{`<Card variant="outline" hoverEffect>
  <Heading as="h3">Feature</Heading>
  <Text>Description of this feature.</Text>
</Card>`}</CodeBlock>

    <h2 id="theming">Theming</h2>
    <p>
      ratio-ui uses CSS custom properties (design tokens) for theming, making it easy to customize
      colors, typography, and spacing across your entire application.
    </p>

    <h3 id="color-tokens">Color Tokens</h3>
    <p>
      The color system is built around a primary palette with semantic aliases. All tokens are defined
      in <code>tokens/theme.css</code> and can be overridden in your own CSS.
    </p>
    <CodeBlock>{`:root {
  --color-primary-50: #eff6ff;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-900: #1e3a5f;
}`}</CodeBlock>

    <h3 id="dark-mode">Dark Mode</h3>
    <p>
      Dark mode is activated via <code>data-theme=&quot;dark&quot;</code> on the <code>&lt;html&gt;</code> element.
      All components automatically adapt their colors. Use the <code>ThemeToggle</code> component to
      let users switch between light and dark mode.
    </p>
    <CodeBlock>{`<ThemeToggle
  theme={currentTheme}
  onThemeChange={(theme) => setTheme(theme)}
/>`}</CodeBlock>

    <h2 id="responsive-design">Responsive Design</h2>
    <p>
      All layout components are responsive by default. The grid system supports breakpoint-specific
      column configurations, and components like this ThreeColumnLayout automatically collapse
      side columns on smaller screens.
    </p>
    <p>
      Use Tailwind's responsive prefixes (<code>sm:</code>, <code>md:</code>, <code>lg:</code>) to
      customize component behavior at different viewport sizes.
    </p>

    <h2 id="custom-hooks">Custom Hooks</h2>
    <p>
      ratio-ui exposes several hooks for common patterns like theme management, media queries, and
      component state. These hooks integrate seamlessly with the component library.
    </p>
    <CodeBlock>{`import { useTheme } from './providers/theme';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  // ...
}`}</CodeBlock>

    <h2 id="performance">Performance</h2>
    <p>
      The library is designed for optimal performance with tree-shaking support, lazy loading of
      heavy components, and minimal runtime overhead. Each component is built as a separate entry
      point, so you only ship the code you use.
    </p>
    <p>
      Client components are marked with <code>&apos;use client&apos;</code> directives for proper Next.js
      App Router support, ensuring server components are used wherever possible.
    </p>

    <h2 id="api-reference">API Reference</h2>
    <p>
      Every component exports its props interface alongside the component itself. Import types
      directly from the component path:
    </p>
    <CodeBlock>{`import { Button, type ButtonProps } from '@eventuras/ratio-ui/core/Button';
import { Card, type CardProps } from '@eventuras/ratio-ui/core/Card';
import { TreeView, type TreeViewProps } from '@eventuras/ratio-ui/core/TreeView';`}</CodeBlock>

    <h2 id="faq">FAQ</h2>
    <p><strong>Can I use ratio-ui without Tailwind CSS?</strong></p>
    <p>
      No, ratio-ui depends on Tailwind CSS v4 for its styling. The component CSS is built with
      Tailwind utilities and custom properties.
    </p>
    <p><strong>Does it work with React 18?</strong></p>
    <p>
      Yes, ratio-ui supports both React 18 and React 19. Peer dependency is set to
      <code>&gt;=18 &lt;20</code>.
    </p>
    <p><strong>How do I customize colors?</strong></p>
    <p>
      Override the CSS custom properties in your own stylesheet. See the Theming section above
      for the full list of available tokens.
    </p>
  </article>
);

const meta: Meta<ThreeColumnLayoutProps> = {
  title: 'Pages/ThreeColumnLayout',
  component: ThreeColumnLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<ThreeColumnLayoutProps>;

export const Default: Story = {
  args: {
    left: (
      <TreeView
        tree={sidebarTree}
        currentPath="#components"
        LinkComponent={StoryLink}
        aria-label="Documentation"
      />
    ),
    right: <TableOfContents headings={tocHeadings} />,
    children: <SampleContent />,
  },
};

export const WithoutRightColumn: Story = {
  args: {
    left: (
      <TreeView
        tree={sidebarTree}
        currentPath="#installation"
        LinkComponent={StoryLink}
        aria-label="Documentation"
      />
    ),
    children: <SampleContent />,
  },
};

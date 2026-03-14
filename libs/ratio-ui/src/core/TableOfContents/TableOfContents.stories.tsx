import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { TableOfContents, TableOfContentsProps, TocHeading } from './TableOfContents';

const sampleHeadings: TocHeading[] = [
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'prerequisites', text: 'Prerequisites', level: 3 },
  { id: 'npm-install', text: 'npm install', level: 3 },
  { id: 'configuration', text: 'Configuration', level: 2 },
  { id: 'environment-variables', text: 'Environment Variables', level: 3 },
  { id: 'database-setup', text: 'Database Setup', level: 3 },
  { id: 'usage', text: 'Usage', level: 2 },
  { id: 'basic-example', text: 'Basic Example', level: 3 },
  { id: 'advanced-usage', text: 'Advanced Usage', level: 3 },
  { id: 'api-reference', text: 'API Reference', level: 2 },
  { id: 'troubleshooting', text: 'Troubleshooting', level: 2 },
];

const meta: Meta<TableOfContentsProps> = {
  title: 'Core/TableOfContents',
  component: TableOfContents,
  decorators: [
    (Story) => (
      <div style={{ width: 224, padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<TableOfContentsProps>;

export const Default: Story = {
  args: {
    headings: sampleHeadings,
  },
};

export const FewHeadings: Story = {
  args: {
    headings: [
      { id: 'overview', text: 'Overview', level: 2 },
      { id: 'usage', text: 'Usage', level: 2 },
    ],
  },
};

export const WithScrollSpy: Story = {
  args: {
    headings: sampleHeadings,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1, height: '80vh', overflow: 'auto' }}>
        {args.headings.map((h) => (
          <section key={h.id} id={h.id} style={{ minHeight: '40vh', padding: '1rem' }}>
            {h.level === 2 ? <h2>{h.text}</h2> : <h3>{h.text}</h3>}
            <p>Content for {h.text}...</p>
          </section>
        ))}
      </div>
      <div style={{ width: 224, position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
        <TableOfContents {...args} />
      </div>
    </div>
  ),
};

import { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Core/Accordion (Beta)',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion>
      <Accordion.Item>
        <Accordion.Summary>What is Eventuras?</Accordion.Summary>
        <Accordion.Content>
          An open-source platform for managing courses, conferences, and event registrations.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Summary>Is it free to use?</Accordion.Summary>
        <Accordion.Content>
          Yes. The source is licensed under the project license — see the repository for details.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Summary>How do I get started?</Accordion.Summary>
        <Accordion.Content>
          Clone the monorepo, install dependencies with pnpm, and follow the setup guide.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const InitiallyOpen: Story = {
  render: () => (
    <Accordion>
      <Accordion.Item open>
        <Accordion.Summary>This panel starts open</Accordion.Summary>
        <Accordion.Content>The `open` prop maps to the standard HTML attribute.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Summary>This one starts closed</Accordion.Summary>
        <Accordion.Content>Click the header to expand.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Exclusive: Story = {
  render: () => (
    <Accordion>
      <Accordion.Item name="faq">
        <Accordion.Summary>Sharing a `name` makes items mutually exclusive</Accordion.Summary>
        <Accordion.Content>
          Opening this one closes the others in the same group. This is native HTML behavior.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item name="faq">
        <Accordion.Summary>Second item</Accordion.Summary>
        <Accordion.Content>Only one item in the group stays open at a time.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item name="faq">
        <Accordion.Summary>Third item</Accordion.Summary>
        <Accordion.Content>Try clicking around.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const TechnicalDetails: Story = {
  render: () => (
    <Accordion>
      <Accordion.Item>
        <Accordion.Summary>Technical details</Accordion.Summary>
        <Accordion.Content>
          <pre className="whitespace-pre-wrap break-all text-xs text-(--text-muted)">
            {`Error: ENOENT: no such file or directory, open '/tmp/missing.txt'
    at Object.openSync (node:fs:603:3)
    at Object.readFileSync (node:fs:471:35)
    at /app/server.js:42:18`}
          </pre>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

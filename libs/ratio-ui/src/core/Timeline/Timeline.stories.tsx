import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Core/Timeline (beta)',
  component: Timeline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Basic: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item
        timestamp="2026-04-19 10:22"
        title="Order created"
        status="success"
        actor="Ada Lovelace"
      />
      <Timeline.Item
        timestamp="2026-04-19 10:25"
        title="Payment method updated"
        actor="Ada Lovelace"
      />
      <Timeline.Item
        timestamp="2026-04-19 11:00"
        title="Order verified"
        status="info"
      />
    </Timeline>
  ),
};

export const WithMetadata: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item
        timestamp="2026-04-19 10:22"
        title="Order created"
        status="success"
        actor="Ada Lovelace"
      >
        <pre className="rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-900">
{JSON.stringify({ orderId: 42, total: 1200 }, null, 2)}
        </pre>
      </Timeline.Item>
      <Timeline.Item
        timestamp="2026-04-19 10:25"
        title="Payment method updated"
        actor="Ada Lovelace"
      >
        <div>Changed from <strong>Email invoice</strong> to <strong>EHF invoice</strong>.</div>
      </Timeline.Item>
    </Timeline>
  ),
};

export const AllStatuses: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item timestamp="10:00" title="Neutral event" status="neutral" />
      <Timeline.Item timestamp="10:05" title="Info event" status="info" />
      <Timeline.Item timestamp="10:10" title="Success event" status="success" />
      <Timeline.Item timestamp="10:15" title="Warning event" status="warning" />
      <Timeline.Item timestamp="10:20" title="Error event" status="error" />
    </Timeline>
  ),
};

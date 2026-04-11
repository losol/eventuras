import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';

import { Button } from '../core/Button/Button';
import { Stack } from '../layout/Stack/Stack';

import { ToastRenderer } from './ToastRenderer';
import { useToast } from './useToast';

const meta = {
  title: 'Toast/Toast',
  component: ToastRenderer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const TriggerAllStatuses = () => {
  const toast = useToast();
  return (
    <Stack gap="sm">
      <Button variant="primary" onClick={() => toast.success('Saved successfully')}>
        Trigger success
      </Button>
      <Button variant="primary" onClick={() => toast.error('Something went wrong')}>
        Trigger error
      </Button>
      <Button variant="primary" onClick={() => toast.warning('Password expires soon')}>
        Trigger warning
      </Button>
      <Button variant="primary" onClick={() => toast.info('New version available')}>
        Trigger info
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.success('File uploaded', {
            description: 'report-2026-04.pdf (3.2 MB)',
          })
        }
      >
        Trigger with description
      </Button>
    </Stack>
  );
};

export const Playground: Story = {
  render: () => (
    <>
      <TriggerAllStatuses />
      <ToastRenderer />
    </>
  ),
};

export const WithDescription: Story = {
  render: () => {
    const Trigger = () => {
      const toast = useToast();
      return (
        <Button
          variant="primary"
          onClick={() =>
            toast.info('Update available', {
              description: 'A new version is ready to install.',
            })
          }
        >
          Check for updates
        </Button>
      );
    };
    return (
      <>
        <Trigger />
        <ToastRenderer />
      </>
    );
  },
};

export const ProgrammaticDismissal: Story = {
  render: () => {
    const Trigger = () => {
      const toast = useToast();
      return (
        <Stack gap="sm">
          <Button
            variant="primary"
            onClick={() => {
              const key = toast.info('Processing...', { expiresAfter: 60_000 });
              setTimeout(() => toast.remove(key), 2000);
            }}
          >
            Show and auto-dismiss after 2s
          </Button>
        </Stack>
      );
    };
    return (
      <>
        <Trigger />
        <ToastRenderer />
      </>
    );
  },
};

const InteractionTrigger = () => {
  const toast = useToast();
  return (
    <Button variant="primary" onClick={() => toast.success('Hello from test')}>
      Show toast
    </Button>
  );
};

export const ShowsToastOnClick: Story = {
  render: () => (
    <>
      <InteractionTrigger />
      <ToastRenderer />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Show toast' });
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(canvas.getByText('Hello from test')).toBeInTheDocument();
    });

    const closeBtn = canvas.getByRole('button', { name: 'Close' });
    await userEvent.click(closeBtn);

    await waitFor(() => {
      expect(canvas.queryByText('Hello from test')).not.toBeInTheDocument();
    });
  },
};

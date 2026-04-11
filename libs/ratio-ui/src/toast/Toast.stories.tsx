import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../core/Button/Button';
import { Stack } from '../layout/Stack/Stack';

import { ToastRenderer } from './ToastRenderer';
import { toastQueue } from './toastQueue';
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

const clearQueue = () => {
  // toastQueue is a module-level singleton; clear any leftover toasts from
  // previous play runs so each test starts from a known state.
  for (const t of [...toastQueue.visibleToasts]) {
    toastQueue.close(t.key);
  }
};

const ClickDismissTrigger = () => {
  const toast = useToast();
  return (
    <Button variant="primary" onClick={() => toast.success('Hello from test')}>
      Show toast
    </Button>
  );
};

export const ClickToDismiss: Story = {
  render: () => (
    <>
      <ClickDismissTrigger />
      <ToastRenderer />
    </>
  ),
  play: async ({ canvasElement }) => {
    clearQueue();
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));

    const toast = await body.findByText('Hello from test');
    expect(toast).toBeInTheDocument();

    await userEvent.click(body.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(body.queryByText('Hello from test')).not.toBeInTheDocument();
    });
  },
};

const ProgrammaticDismissTrigger = () => {
  const toast = useToast();
  const keyRef = useRef<string | null>(null);
  const [shown, setShown] = useState(false);

  return (
    <Stack gap="sm">
      <Button
        variant="primary"
        onClick={() => {
          keyRef.current = toast.info('Dismiss me programmatically', {
            expiresAfter: 60_000,
          });
          setShown(true);
        }}
      >
        Show toast
      </Button>
      <Button
        variant="secondary"
        disabled={!shown}
        onClick={() => {
          if (keyRef.current) {
            toast.remove(keyRef.current);
            keyRef.current = null;
            setShown(false);
          }
        }}
      >
        Remove via key
      </Button>
    </Stack>
  );
};

export const ProgrammaticRemove: Story = {
  render: () => (
    <>
      <ProgrammaticDismissTrigger />
      <ToastRenderer />
    </>
  ),
  play: async ({ canvasElement }) => {
    clearQueue();
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));

    const toast = await body.findByText('Dismiss me programmatically');
    expect(toast).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove via key' }));

    await waitFor(() => {
      expect(body.queryByText('Dismiss me programmatically')).not.toBeInTheDocument();
    });
  },
};

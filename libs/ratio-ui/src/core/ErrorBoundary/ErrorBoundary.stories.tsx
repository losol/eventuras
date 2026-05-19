import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';
import { Panel } from '../Panel';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Core/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Catches render-time errors in descendants and shows a fallback. ' +
          'Does **not** catch errors in event handlers, async callbacks, or SSR.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

function Boom({ when }: { when: boolean }): React.JSX.Element {
  if (when) {
    throw new Error('Boom — synthetic render-time failure');
  }
  return <p>Rendering normally.</p>;
}

/** Default fallback (compound `ErrorBoundary.DefaultFallback`) is used when no `fallback` prop is provided. */
export const DefaultFallback: Story = {
  render: () => (
    <ErrorBoundary>
      <Boom when={true} />
    </ErrorBoundary>
  ),
};

/** Pass a static `ReactNode` as `fallback` for a simple replacement. */
export const StaticFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <Panel variant="alert" status="error">
          Couldn't load this widget. Reload the page to try again.
        </Panel>
      }
    >
      <Boom when={true} />
    </ErrorBoundary>
  ),
};

/** Pass a render function to access `error` and `reset` in the fallback. */
export const RenderFunctionFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <Panel variant="alert" status="error">
          <p className="font-bold mb-2">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="underline hover:opacity-80"
          >
            Reset boundary
          </button>
        </Panel>
      )}
    >
      <Boom when={true} />
    </ErrorBoundary>
  ),
};

function ResetKeysDemo() {
  const [attempt, setAttempt] = useState(0);
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setAttempt(a => a + 1)}
        className="px-4 py-2 rounded bg-primary-600 text-white"
      >
        Retry (attempt #{attempt})
      </button>
      <ErrorBoundary resetKeys={[attempt]}>
        {/* Throws on even attempts, renders on odd */}
        <Boom when={attempt % 2 === 0} />
      </ErrorBoundary>
    </div>
  );
}

/** `resetKeys` clears the error state when any key changes. Useful for "Retry" UX outside the fallback. */
export const ResetKeys: Story = {
  render: () => <ResetKeysDemo />,
};

/** `onError` runs side-effects (logging, Sentry). Open the console to see the log. */
export const OnErrorLogging: Story = {
  render: () => (
    <ErrorBoundary
      onError={(error, info) => {
        // eslint-disable-next-line no-console
        console.error('[ErrorBoundary]', error, info);
      }}
    >
      <Boom when={true} />
    </ErrorBoundary>
  ),
};

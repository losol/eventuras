// ErrorPage.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorPage, type ErrorPageProps } from './ErrorPage';

/** See: {@link ErrorPageProps} */
const meta: Meta<typeof ErrorPage> = {
  title: 'Pages/ErrorPage',
  component: ErrorPage,
  argTypes: {
    tone: { control: 'inline-radio', options: ['fatal', 'warning', 'info', 'success'] },
    fullScreen: { control: 'boolean' },
    className: { control: 'text' },
  },
  // ➜ Safe default for Storybook canvas
  args: { tone: 'fatal', fullScreen: false },
};
export default meta;

type Story = StoryObj<typeof ErrorPage>;

/** ➜ Interactive playground */
export const Playground: Story = {
  render: (args) => (
    <ErrorPage {...args}>
      {/* Title */}
      <ErrorPage.Title>Something went wrong</ErrorPage.Title>
      {/* Description */}
      <ErrorPage.Description>We couldn’t complete your request.</ErrorPage.Description>
      {/* Extra */}
      <ErrorPage.Extra>If this persists, contact support with the error details.</ErrorPage.Extra>
      {/* Action */}
      <ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Go Home</button>
      </ErrorPage.Action>
    </ErrorPage>
  ),
};

export const Fatal: Story = {
  render: () => (
    <ErrorPage tone="fatal">
      <ErrorPage.Title>Critical failure</ErrorPage.Title>
      <ErrorPage.Description>An unexpected system error occurred.</ErrorPage.Description>
      <ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Reload</button>
      </ErrorPage.Action>
    </ErrorPage>
  ),
};

/** ➜ Warning tone */
export const Warning: Story = {
  render: () => (
    <ErrorPage tone="warning">
      <ErrorPage.Title>Heads up</ErrorPage.Title>
      <ErrorPage.Description>Some features may not work as expected.</ErrorPage.Description>
      <ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Retry</button>
      </ErrorPage.Action>
    </ErrorPage>
  ),
};

/** ➜ Info tone */
export const Info: Story = {
  render: () => (
    <ErrorPage tone="info">
      <ErrorPage.Title>Maintenance mode</ErrorPage.Title>
      <ErrorPage.Description>We’re performing scheduled updates.</ErrorPage.Description>
      <ErrorPage.Extra>Estimated time: ~15 minutes.</ErrorPage.Extra>
    </ErrorPage>
  ),
};

/** ➜ Success tone (e.g., recovery state) */
export const Success: Story = {
  render: () => (
    <ErrorPage tone="success">
      <ErrorPage.Title>Recovered</ErrorPage.Title>
      <ErrorPage.Description>The system is back online.</ErrorPage.Description>
      <ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Continue</button>
      </ErrorPage.Action>
    </ErrorPage>
  ),
};

/** ➜ Side-by-side gallery for quick visual QA */
export const Gallery: Story = {
  render: () => (
    <div className="grid gap-6">
      {/* Fatal */}
      <ErrorPage tone="fatal" fullScreen={false}>
        <ErrorPage.Title>Critical failure</ErrorPage.Title>
        <ErrorPage.Description>Unexpected error.</ErrorPage.Description>
      </ErrorPage>
      {/* Warning */}
      <ErrorPage tone="warning" fullScreen={false}>
        <ErrorPage.Title>Degraded performance</ErrorPage.Title>
        <ErrorPage.Description>Some features limited.</ErrorPage.Description>
      </ErrorPage>
      {/* Info */}
      <ErrorPage tone="info" fullScreen={false}>
        <ErrorPage.Title>Maintenance</ErrorPage.Title>
        <ErrorPage.Description>Back soon.</ErrorPage.Description>
      </ErrorPage>
      {/* Success */}
      <ErrorPage tone="success" fullScreen={false}>
        <ErrorPage.Title>Recovered</ErrorPage.Title>
        <ErrorPage.Description>All good now.</ErrorPage.Description>
      </ErrorPage>
    </div>
  ),
};

/** ➜ Fullscreen demo (may cover canvas) */
export const FullScreen: Story = {
  render: () => (
    <ErrorPage tone="fatal" fullScreen>
      <ErrorPage.Title>Critical failure</ErrorPage.Title>
      <ErrorPage.Description>Please reload the page.</ErrorPage.Description>
      <ErrorPage.Action>
        <button className="px-4 py-2 rounded bg-black text-white">Reload</button>
      </ErrorPage.Action>
    </ErrorPage>
  ),
};

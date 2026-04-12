import type { Meta, StoryObj } from '@storybook/react';
import { PageOverlay } from './PageOverlay';
import { ErrorBlock } from '../../blocks/Error';

const meta: Meta<typeof PageOverlay> = {
  title: 'Core/PageOverlay',
  component: PageOverlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['neutral', 'error', 'info', 'warning'],
      description: 'Visual status of the overlay',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Whether the overlay should cover the full screen',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageOverlay>;

export const Default: Story = {
  args: {
    fullScreen: true,
    status: 'neutral',
    children: (
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Default Overlay</h1>
        <p className="text-xl">This is the default dark overlay variant</p>
      </div>
    ),
  },
};

export const ErrorVariant: Story = {
  args: {
    fullScreen: true,
    status: 'error',
    children: (
      <ErrorBlock type="server-error" status="error">
        <ErrorBlock.Title>Server Error</ErrorBlock.Title>
        <ErrorBlock.Description>
          The server encountered an unexpected error. Please try again later.
        </ErrorBlock.Description>
        <ErrorBlock.Actions>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Go Home
          </button>
        </ErrorBlock.Actions>
      </ErrorBlock>
    ),
  },
};

export const InfoVariant: Story = {
  args: {
    fullScreen: true,
    status: 'info',
    children: (
      <ErrorBlock type="not-found" status="info">
        <ErrorBlock.Title>Page Not Found</ErrorBlock.Title>
        <ErrorBlock.Description>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </ErrorBlock.Description>
        <ErrorBlock.Actions>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Go Home
          </button>
        </ErrorBlock.Actions>
      </ErrorBlock>
    ),
  },
};

export const WarningVariant: Story = {
  args: {
    fullScreen: true,
    status: 'warning',
    children: (
      <ErrorBlock type="generic" status="warning">
        <ErrorBlock.Title>Maintenance Mode</ErrorBlock.Title>
        <ErrorBlock.Description>
          The system is currently undergoing maintenance. Please check back soon.
        </ErrorBlock.Description>
        <ErrorBlock.Details>
          Expected completion time: 2 hours
        </ErrorBlock.Details>
        <ErrorBlock.Actions>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
            Check Status
          </button>
        </ErrorBlock.Actions>
      </ErrorBlock>
    ),
  },
};

export const WithCustomContent: Story = {
  args: {
    fullScreen: true,
    status: 'neutral',
    children: (
      <div className="max-w-md text-center text-white space-y-6">
        <div>
          <h1 className="text-5xl font-bold mb-2">🚀</h1>
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <p className="text-lg mb-6">
            We&apos;re working hard to bring you something amazing. Stay tuned!
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors font-medium">
            Notify Me
          </button>
          <button className="px-6 py-3 border border-white text-white rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium">
            Learn More
          </button>
        </div>
      </div>
    ),
  },
};

export const NonFullScreen: Story = {
  args: {
    fullScreen: false,
    status: 'info',
    children: (
      <div className="text-center text-white p-12">
        <h2 className="text-2xl font-bold mb-4">Modal Overlay</h2>
        <p className="mb-4">This overlay is not fullscreen</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Close
        </button>
      </div>
    ),
  },
};

export const ErrorWithContactInfo: Story = {
  args: {
    fullScreen: true,
    status: 'error',
    children: (
      <ErrorBlock type="server-error" status="error">
        <ErrorBlock.Title>Critical Error</ErrorBlock.Title>
        <ErrorBlock.Description>
          A critical error occurred. Our team has been notified and is working on it.
        </ErrorBlock.Description>
        <ErrorBlock.Details>
          <div className="text-sm space-y-2">
            <p className="font-medium">Need immediate help?</p>
            <p>
              Support Email:{' '}
              <a
                href="mailto:support@example.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                support@example.com
              </a>
            </p>
            <p>
              Phone:{' '}
              <a
                href="tel:+1234567890"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                +1 (234) 567-890
              </a>
            </p>
            <p className="text-xs opacity-75 mt-4">Error ID: ERR-2025-10-20-12345</p>
          </div>
        </ErrorBlock.Details>
        <ErrorBlock.Actions>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Try Again
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Go Home
          </button>
        </ErrorBlock.Actions>
      </ErrorBlock>
    ),
  },
};

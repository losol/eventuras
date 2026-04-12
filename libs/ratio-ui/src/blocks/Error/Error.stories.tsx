import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBlock } from './Error';

const meta: Meta<typeof ErrorBlock> = {
  title: 'Blocks/Error',
  component: ErrorBlock,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBlock>;

export const ServerError: Story = {
  render: () => (
    <ErrorBlock type="server-error" status="error">
      <ErrorBlock.Title>Server Error</ErrorBlock.Title>
      <ErrorBlock.Description>
        The server encountered an error and could not complete your request.
      </ErrorBlock.Description>
      <ErrorBlock.Details>
        Error code: 500 - Internal Server Error
      </ErrorBlock.Details>
      <ErrorBlock.Actions>
        <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Go Home
        </a>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </ErrorBlock.Actions>
    </ErrorBlock>
  ),
};

export const NetworkError: Story = {
  render: () => (
    <ErrorBlock type="network-error" status="error">
      <ErrorBlock.Title>Connection Error</ErrorBlock.Title>
      <ErrorBlock.Description>
        Unable to connect to the server. Please check your internet connection.
      </ErrorBlock.Description>
      <ErrorBlock.Details>
        Please try again in a few moments.
      </ErrorBlock.Details>
      <ErrorBlock.Actions>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Back to Events
        </button>
      </ErrorBlock.Actions>
    </ErrorBlock>
  ),
};

export const Forbidden: Story = {
  render: () => (
    <ErrorBlock type="forbidden" status="warning">
      <ErrorBlock.Title>Access Denied</ErrorBlock.Title>
      <ErrorBlock.Description>
        You don't have permission to access this resource.
      </ErrorBlock.Description>
      <ErrorBlock.Details>
        If you believe this is an error, please contact your administrator.
      </ErrorBlock.Details>
      <ErrorBlock.Actions>
        <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Go Home
        </a>
      </ErrorBlock.Actions>
    </ErrorBlock>
  ),
};

export const NotFound: Story = {
  render: () => (
    <ErrorBlock type="not-found" status="info">
      <ErrorBlock.Title>Not Found</ErrorBlock.Title>
      <ErrorBlock.Description>
        The resource you're looking for doesn't exist or has been moved.
      </ErrorBlock.Description>
      <ErrorBlock.Actions>
        <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Go Home
        </a>
        <a href="/search" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Search
        </a>
      </ErrorBlock.Actions>
    </ErrorBlock>
  ),
};

export const GenericError: Story = {
  render: () => (
    <ErrorBlock type="generic" status="error">
      <ErrorBlock.Title>Something Went Wrong</ErrorBlock.Title>
      <ErrorBlock.Description>
        An unexpected error occurred. Please try again.
      </ErrorBlock.Description>
      <ErrorBlock.Actions>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Retry
        </button>
      </ErrorBlock.Actions>
    </ErrorBlock>
  ),
};

export const MinimalError: Story = {
  render: () => (
    <ErrorBlock type="generic" status="error">
      <ErrorBlock.Title>Error</ErrorBlock.Title>
      <ErrorBlock.Description>
        Something went wrong.
      </ErrorBlock.Description>
    </ErrorBlock>
  ),
};

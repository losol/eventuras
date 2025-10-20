import type { Meta, StoryObj } from '@storybook/react';
import { Error } from './Error';

const meta: Meta<typeof Error> = {
  title: 'Blocks/Error',
  component: Error,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Error>;

export const ServerError: Story = {
  render: () => (
    <Error type="server-error" tone="error">
      <Error.Title>Server Error</Error.Title>
      <Error.Description>
        The server encountered an error and could not complete your request.
      </Error.Description>
      <Error.Details>
        Error code: 500 - Internal Server Error
      </Error.Details>
      <Error.Actions>
        <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Go Home
        </a>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </Error.Actions>
    </Error>
  ),
};

export const NetworkError: Story = {
  render: () => (
    <Error type="network-error" tone="error">
      <Error.Title>Connection Error</Error.Title>
      <Error.Description>
        Unable to connect to the server. Please check your internet connection.
      </Error.Description>
      <Error.Details>
        Please try again in a few moments.
      </Error.Details>
      <Error.Actions>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Back to Events
        </button>
      </Error.Actions>
    </Error>
  ),
};

export const Forbidden: Story = {
  render: () => (
    <Error type="forbidden" tone="warning">
      <Error.Title>Access Denied</Error.Title>
      <Error.Description>
        You don't have permission to access this resource.
      </Error.Description>
      <Error.Details>
        If you believe this is an error, please contact your administrator.
      </Error.Details>
      <Error.Actions>
        <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Go Home
        </a>
      </Error.Actions>
    </Error>
  ),
};

export const NotFound: Story = {
  render: () => (
    <Error type="not-found" tone="info">
      <Error.Title>Not Found</Error.Title>
      <Error.Description>
        The resource you're looking for doesn't exist or has been moved.
      </Error.Description>
      <Error.Actions>
        <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Go Home
        </a>
        <a href="/search" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Search
        </a>
      </Error.Actions>
    </Error>
  ),
};

export const GenericError: Story = {
  render: () => (
    <Error type="generic" tone="error">
      <Error.Title>Something Went Wrong</Error.Title>
      <Error.Description>
        An unexpected error occurred. Please try again.
      </Error.Description>
      <Error.Actions>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Retry
        </button>
      </Error.Actions>
    </Error>
  ),
};

export const MinimalError: Story = {
  render: () => (
    <Error type="generic" tone="error">
      <Error.Title>Error</Error.Title>
      <Error.Description>
        Something went wrong.
      </Error.Description>
    </Error>
  ),
};

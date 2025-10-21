'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';

const logger = Logger.create({ namespace: 'web:admin:error', context: { section: 'admin' } });

/**
 * Admin section error boundary
 * Provides admin-specific error handling and navigation
 */
export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(
      {
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        },
      },
      'Error in admin section'
    );
  }, [error]);

  return (
    <PageOverlay variant="error" fullScreen>
      <Error type="server-error" tone="error">
        <Error.Title>Admin Error</Error.Title>
        <Error.Description>
          An error occurred in the admin section. This has been logged for investigation.
        </Error.Description>
        {error.digest && (
          <Error.Details>
            <div className="text-sm opacity-75">Error ID: {error.digest}</div>
          </Error.Details>
        )}
        <Error.Actions>
          <button
            onClick={reset}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Admin Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Go to Home
          </Link>
        </Error.Actions>
      </Error>
    </PageOverlay>
  );
}

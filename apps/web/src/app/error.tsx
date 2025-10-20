'use client'; // Error boundaries must be Client Components

import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { useEffect } from 'react';
import { Logger } from '@eventuras/logger';
import Link from 'next/link';

const logger = Logger.create({ namespace: 'web:error' });

/**
 * Root error boundary
 * Catches runtime errors in the app (excluding root layout errors)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring service
    logger.error(
      {
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        },
      },
      'Unhandled error in app'
    );
  }, [error]);

  return (
    <PageOverlay variant="error" fullScreen>
      <Error type="server-error" tone="error">
        <Error.Title>Something Went Wrong</Error.Title>
        <Error.Description>
          An unexpected error occurred. Please try again or contact support if the problem
          persists.
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
            href="/"
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Go to Home
          </Link>
        </Error.Actions>
      </Error>
    </PageOverlay>
  );
}

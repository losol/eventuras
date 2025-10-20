'use client'; // Global error must be a Client Component

import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { useEffect } from 'react';

/**
 * Global error handler
 * Catches errors in the root layout, including errors in the root error boundary
 * Must include <html> and <body> tags as it replaces the root layout
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error - avoid using custom logger here to prevent circular errors
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <PageOverlay variant="error" fullScreen>
          <Error type="server-error" tone="error">
            <Error.Title>Critical Error</Error.Title>
            <Error.Description>
              A critical error occurred. Please refresh the page or contact support.
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
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Reload Page
              </a>
            </Error.Actions>
          </Error>
        </PageOverlay>
      </body>
    </html>
  );
}

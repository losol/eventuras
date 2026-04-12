'use client'; // Global error must be a Client Component

import { useEffect } from 'react';

import { ErrorBlock } from '@eventuras/ratio-ui/blocks/Error';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';

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
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Log the error - avoid using custom logger here to prevent circular errors
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <PageOverlay status="error" fullScreen>
          <ErrorBlock type="server-error" status="error">
            <ErrorBlock.Title>Critical Error</ErrorBlock.Title>
            <ErrorBlock.Description>
              A critical error occurred. Please refresh the page or contact support.
            </ErrorBlock.Description>
            {error.digest && (
              <ErrorBlock.Details>
                <div className="text-sm opacity-75">Error ID: {error.digest}</div>
              </ErrorBlock.Details>
            )}
            <ErrorBlock.Actions>
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
            </ErrorBlock.Actions>
          </ErrorBlock>
        </PageOverlay>
      </body>
    </html>
  );
}

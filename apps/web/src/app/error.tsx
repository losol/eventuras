'use client';

import { RouteErrorView } from '@/components/RouteErrorView';

// Module-level constant so `links` stays stable across re-renders.
const LINKS = [{ href: '/', label: 'Go to Home' }] as const;

/**
 * Root error boundary
 * Catches runtime errors in the app (excluding root layout errors)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      title="Something Went Wrong"
      description="An unexpected error occurred. Please try again or contact support if the problem persists."
      loggerNamespace="web:error"
      links={LINKS}
    />
  );
}

'use client';

import { RouteErrorView } from '@/components/RouteErrorView';

// Module-level constants so `tags`/`links` don't re-mount the underlying
// `useEffect` (which would fire duplicate Sentry/logger captures).
const TAGS = { section: 'admin' } as const;
const LINKS = [
  { href: '/admin', label: 'Back to Admin Dashboard' },
  { href: '/', label: 'Go to Home' },
] as const;

/**
 * Admin section error boundary
 * Provides admin-specific error handling and navigation
 */
export default function AdminErrorBoundary({
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
      title="Admin Error"
      description="An error occurred in the admin section. This has been logged for investigation."
      loggerNamespace="web:admin:error"
      tags={TAGS}
      links={LINKS}
    />
  );
}

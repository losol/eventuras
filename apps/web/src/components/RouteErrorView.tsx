'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { usePathname, useSearchParams } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { ErrorBlock } from '@eventuras/ratio-ui/blocks/Error';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Link } from '@eventuras/ratio-ui-next/Link';

export interface RouteErrorViewLink {
  href: string;
  label: string;
}

export interface RouteErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Heading shown on the error page */
  title: string;
  /** Short user-facing explanation */
  description: string;
  /** Logger namespace, e.g. `web:admin:error`. Reads pathname + search and logs to it. */
  loggerNamespace: string;
  /** Searchable key-value tags (low cardinality, e.g. `section`, `tab`). Forwarded to logger context and the underlying error reporter. */
  tags?: Record<string, string>;
  /** Action links shown after the "Try Again" button */
  links?: ReadonlyArray<RouteErrorViewLink>;
}

/**
 * Shared body for Next.js route-level error boundaries
 * (`app/error.tsx`, `app/(admin)/admin/error.tsx`, etc.).
 *
 * Captures the error to Sentry and the eventuras logger with consistent
 * pathname/search context, then renders the standard `PageOverlay` +
 * `ErrorBlock` shell with a "Try Again" button and optional navigation links.
 */
export function RouteErrorView({
  error,
  reset,
  title,
  description,
  loggerNamespace,
  tags,
  links,
}: Readonly<RouteErrorViewProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString() ?? '';
    const logger = Logger.create({
      namespace: loggerNamespace,
      context: tags,
    });

    logger.error(
      {
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        },
        pathname,
        search,
      },
      'Unhandled error in route'
    );

    Sentry.captureException(error, {
      tags,
      extra: { pathname, search, digest: error.digest },
    });
  }, [error, loggerNamespace, pathname, searchParams, tags]);

  return (
    <PageOverlay status="error" fullScreen>
      <ErrorBlock type="server-error" status="error">
        <ErrorBlock.Title>{title}</ErrorBlock.Title>
        <ErrorBlock.Description>{description}</ErrorBlock.Description>
        {error.digest && (
          <ErrorBlock.Details>
            <div className="text-sm opacity-75">Error ID: {error.digest}</div>
          </ErrorBlock.Details>
        )}
        <ErrorBlock.Actions>
          <Button variant="danger" onClick={reset}>
            Try Again
          </Button>
          {links?.map(link => (
            <Link key={link.href} href={link.href} variant="button-secondary">
              {link.label}
            </Link>
          ))}
        </ErrorBlock.Actions>
      </ErrorBlock>
    </PageOverlay>
  );
}

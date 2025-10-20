import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Link } from '@eventuras/ratio-ui-next/Link';

/**
 * Root not-found page
 * Handles 404 errors across the entire application
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <PageOverlay variant="info" fullScreen>
      <Error type="not-found" tone="info">
        <Error.Title>Page Not Found</Error.Title>
        <Error.Description>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Error.Description>
        <Error.Actions>
          <Link
            href="/"
          >
            Go to Home
          </Link>
        </Error.Actions>
      </Error>
    </PageOverlay>
  );
}

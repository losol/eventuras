import { ErrorBlock } from '@eventuras/ratio-ui/blocks/Error';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Link } from '@eventuras/ratio-ui-next/Link';

/**
 * Root not-found page
 * Handles 404 errors across the entire application
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <PageOverlay status="info" fullScreen>
      <ErrorBlock type="not-found" status="info">
        <ErrorBlock.Title>Page Not Found</ErrorBlock.Title>
        <ErrorBlock.Description>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </ErrorBlock.Description>
        <ErrorBlock.Actions>
          <Link href="/">Go to Home</Link>
        </ErrorBlock.Actions>
      </ErrorBlock>
    </PageOverlay>
  );
}

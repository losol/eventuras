import { ErrorBlock } from '@eventuras/ratio-ui/blocks/Error';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Link } from '@eventuras/ratio-ui-next/Link';

/**
 * Admin not-found page
 * Handles 404 errors in the admin section with admin-specific navigation
 */
export default function AdminNotFound() {
  return (
    <PageOverlay status="info" fullScreen>
      <ErrorBlock type="not-found" status="info">
        <ErrorBlock.Title>Admin Resource Not Found</ErrorBlock.Title>
        <ErrorBlock.Description>
          The admin page or resource you are looking for does not exist or has been moved.
        </ErrorBlock.Description>
        <ErrorBlock.Actions>
          <Link href="/admin">Go to Admin Dashboard</Link>
          <Link href="/">Go to Home</Link>
        </ErrorBlock.Actions>
      </ErrorBlock>
    </PageOverlay>
  );
}

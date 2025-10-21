import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Link } from '@eventuras/ratio-ui-next/Link';

/**
 * Admin not-found page
 * Handles 404 errors in the admin section with admin-specific navigation
 */
export default function AdminNotFound() {
  return (
    <PageOverlay variant="info" fullScreen>
      <Error type="not-found" tone="info">
        <Error.Title>Admin Resource Not Found</Error.Title>
        <Error.Description>
          The admin page or resource you are looking for does not exist or has been moved.
        </Error.Description>
        <Error.Actions>
          <Link href="/admin">Go to Admin Dashboard</Link>
          <Link href="/">Go to Home</Link>
        </Error.Actions>
      </Error>
    </PageOverlay>
  );
}

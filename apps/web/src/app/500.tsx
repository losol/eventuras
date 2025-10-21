import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Link } from '@eventuras/ratio-ui-next/Link';

/**
 * Custom 500 Internal Server Error page
 * Displayed when server-side errors occur during static generation or server rendering
 *
 * Note: This is different from error.tsx which handles runtime errors in the app.
 * This page is used for static 500 errors at the HTTP level.
 */
export default function InternalServerError() {
  return (
    <PageOverlay variant="error" fullScreen>
      <Error type="server-error" tone="error">
        <Error.Title>Internal Server Error</Error.Title>
        <Error.Description>
          The server encountered an unexpected error and could not complete your request. Please try
          again later or contact support if the problem persists.
        </Error.Description>
        <Error.Actions>
          <Link href="/" variant="button-primary">
            Go to Home
          </Link>
        </Error.Actions>
      </Error>
    </PageOverlay>
  );
}

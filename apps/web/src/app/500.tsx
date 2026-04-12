import { ErrorBlock } from '@eventuras/ratio-ui/blocks/Error';
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
    <PageOverlay status="error" fullScreen>
      <ErrorBlock type="server-error" status="error">
        <ErrorBlock.Title>Internal Server Error</ErrorBlock.Title>
        <ErrorBlock.Description>
          The server encountered an unexpected error and could not complete your request. Please try
          again later or contact support if the problem persists.
        </ErrorBlock.Description>
        <ErrorBlock.Actions>
          <Link href="/" variant="button-primary">
            Go to Home
          </Link>
        </ErrorBlock.Actions>
      </ErrorBlock>
    </PageOverlay>
  );
}

import React from 'react';

import { NotFound as NotFoundBlock } from '@eventuras/ratio-ui/blocks/NotFound';
import { Link } from '@eventuras/ratio-ui-next';

export default function NotFound() {
  return (
      <NotFoundBlock
        title="404"
        message="This page could not be found."
        actions={
          <Link href="/" variant="button-primary">
            Go home
          </Link>
        }
      />
  );
}


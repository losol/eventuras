'use client';

import React from 'react';
import NextLink from 'next/link';

// Import core Link component from ratio-ui
import { Link as CoreLink, type LinkProps } from '@eventuras/ratio-ui/core/Link';

export const Link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, 'component'>>(
  (props, ref) => (
    <CoreLink
      component={NextLink}
      ref={ref}
      {...props}
    />
  )
);

Link.displayName = 'NextLink';
export default Link;

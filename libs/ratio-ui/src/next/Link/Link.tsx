'use client';

import React from 'react';
import NextLink from 'next/link';
import { Link as CoreLink, LinkProps } from '../../core/Link/Link';

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

'use client';

import type { BoxProps } from '@eventuras/ratio-ui';
import NextLink from 'next/link';
import React from 'react';

import { Link as BaseLink, LinkProps as BaseLinkProps } from './BaseLink';

interface NextLinkProps extends BaseLinkProps {
  passHref?: boolean;
  legacyBehavior?: boolean;
}

const NextLinkWrapper = React.forwardRef<HTMLAnchorElement, NextLinkProps & BoxProps>(
  (props, ref) => {
    const { passHref = true, legacyBehavior = true, ...linkProps } = props;

    return (
      <NextLink href={props.href} passHref={passHref} legacyBehavior={legacyBehavior}>
        <BaseLink {...linkProps} ref={ref} />
      </NextLink>
    );
  }
);

NextLinkWrapper.displayName = 'NextLinkWrapper';

export default NextLinkWrapper;

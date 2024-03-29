// Assuming your base Link component is exported from @eventuras/ui as BaseLink
import { BoxProps, Link as BaseLink, LinkProps as BaseLinkProps } from '@eventuras/ui';
import NextLink from 'next/link';
import React from 'react';

// Extending the original interface to potentially include NextLink specific props
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

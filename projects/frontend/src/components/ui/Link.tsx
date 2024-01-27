import NextLink from 'next/link';
import React from 'react';

import { BoxProps, spacingClassName } from '@/components/ui/Box';
import { buttonStyles } from '@/components/ui/Button';
import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

interface LinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?:
    | 'button-primary'
    | 'button-secondary'
    | 'button-light'
    | 'button-outline'
    | 'button-transparent';
  block?: boolean;
  bgDark?: boolean;
  stretch?: boolean;
  legacyBehavior?: boolean;
  passHref?: boolean;
  [TEST_ID_ATTRIBUTE]?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps & BoxProps>((props, ref) => {
  const {
    href,
    children,
    className,
    bgDark = false,
    block = false,
    variant,
    stretch,
    legacyBehavior,
    passHref,
    'data-test-id': dataTestId,
    ...boxProps
  } = props;

  const textColor =
    bgDark || variant === 'button-primary' ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';
  const blockClasses = block ? 'block' : '';

  let variantClasses = '';
  if (variant?.startsWith('button-')) {
    const buttonVariant = variant.replace('button-', '');
    if (buttonStyles.hasOwnProperty(buttonVariant)) {
      variantClasses = buttonStyles[buttonVariant as keyof typeof buttonStyles];
    }
  }

  const spacing: string = spacingClassName(boxProps, {
    defaultPadding: buttonStyles.defaultPadding,
    defaultMargin: 'm-1',
  });

  const classes = [
    variantClasses,
    textColor,
    blockClasses,
    className,
    spacing,
    stretch ? 'stretched-link' : '',
  ].join(' ');

  return (
    <NextLink
      href={href}
      passHref={passHref}
      legacyBehavior={legacyBehavior}
      className={classes}
      ref={ref}
      data-test-id={dataTestId}
    >
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';

export default Link;

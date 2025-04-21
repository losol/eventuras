import { DATA_TEST_ID } from '@eventuras/utils';
import React from 'react';

import { BoxProps, spacingClassName } from '../../../../libs/ratio-ui/src/layout/Box/Box';
import { buttonStyles } from '../../../../libs/ratio-ui/src/core/Button/Button';

export interface LinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?:
    | 'button-primary'
    | 'button-secondary'
    | 'button-light'
    | 'button-outline'
    | 'button-text';
  block?: boolean;
  bgDark?: boolean;
  linkOverlay?: boolean;
  [DATA_TEST_ID]?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps & BoxProps>((props, ref) => {
  const {
    href,
    children,
    className,
    bgDark = false,
    block = false,
    variant,
    linkOverlay = false,
    ...boxProps
  } = props;

  const textColor =
    bgDark || variant === 'button-primary' ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';
  const blockClasses = block ? 'block' : '';

  let variantClasses = '';
  if (variant?.startsWith('button-')) {
    const buttonVariant = variant.replace('button-', '');
    if (Object.hasOwnProperty.call(buttonStyles, buttonVariant)) {
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
    linkOverlay ? 'link-overlay' : '',
  ].join(' ');

  return (
    <a href={href} className={classes} ref={ref} {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}>
      {children}
    </a>
  );
});

Link.displayName = 'Link';

export default Link;

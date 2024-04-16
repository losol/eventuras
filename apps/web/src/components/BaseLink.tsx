import { DATA_TEST_ID } from '@eventuras/utils';
import React from 'react';

import { BoxProps, spacingClassName } from '../../../../libs/ui/src/Box';
import { buttonStyles } from '../../../../libs/ui/src/Button';

export interface LinkProps {
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
    stretch,
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
    <a href={href} className={classes} ref={ref} {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}>
      {children}
    </a>
  );
});

Link.displayName = 'Link';

export default Link;

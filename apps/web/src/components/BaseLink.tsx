// src/components/BaseLink.tsx
import { DATA_TEST_ID } from '@eventuras/utils';
import React, { forwardRef } from 'react';

import { BoxSpacingProps, buildSpacingClasses } from '../../../../libs/ratio-ui/src/layout/Box/Box';
import { buttonStyles } from '../../../../libs/ratio-ui/src/core/Button/Button';

export interface LinkProps extends BoxSpacingProps {
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
  onDark?: boolean;
  linkOverlay?: boolean;
  [DATA_TEST_ID]?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      children,
      className = '',
      onDark = false,
      block = false,
      variant,
      linkOverlay = false,
      // BoxSpacingProps:
      padding,
      margin,
      border,
      width,
      height,
      [DATA_TEST_ID]: testId,
    },
    ref
  ) => {
    const spacingClasses = buildSpacingClasses({
      padding: 'px-4 py-2',
      margin,
      border,
      width,
      height,
    });

    const textColor =
      onDark || variant === 'button-primary' ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';

    const blockClass = block ? 'block' : '';

    let variantClasses = '';
    if (variant?.startsWith('button-')) {
      const key = variant.replace('button-', '') as keyof typeof buttonStyles;
      if (buttonStyles[key]) {
        variantClasses = buttonStyles[key];
      }
    }

    const classes = [
      spacingClasses,
      variantClasses,
      textColor,
      blockClass,
      linkOverlay && 'link-overlay',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <a href={href} className={classes} ref={ref} {...(testId ? { [DATA_TEST_ID]: testId } : {})}>
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';
export default Link;

// core/Link.tsx
import React from 'react';
import { BoxSpacingProps, buildSpacingClasses } from '../../layout/Box/Box';
import { buttonStyles } from '../Button/Button';

export interface LinkProps extends BoxSpacingProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'button-primary' | 'button-secondary' | 'button-light' | 'button-outline' | 'button-text';
  block?: boolean;
  onDark?: boolean;
  linkOverlay?: boolean;
  component?: React.ElementType; // e.g. next/link
  componentProps?: Record<string, unknown>;
  testId?: string;
}

export const Link = React.forwardRef<HTMLElement, LinkProps>(
  (
    {
      component: Component = 'a',
      componentProps,
      href,
      children,
      className = '',
      onDark = false,
      block = false,
      variant,
      linkOverlay = false,
      padding, margin, border, width, height,
      testId,
      ...rest
    },
    ref
  ) => {
    const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height });
    const textColor =
      onDark || variant === 'button-primary'
        ? 'text-gray-200'
        : 'text-gray-800 dark:text-gray-200';
    const blockClass = block ? 'block' : '';
    let variantClasses = '';
    if (variant?.startsWith('button-')) {
      const key = variant.replace('button-', '') as keyof typeof buttonStyles;
      if (buttonStyles[key]) variantClasses = 'px-4 py-2 ' + buttonStyles[key];
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

    // For Next.js Link, we need to pass data-testid via componentProps
    const finalComponentProps = testId
      ? { ...componentProps, 'data-testid': testId }
      : componentProps;

    return (
      <Component
        href={href}
        className={classes}
        ref={ref}
        {...finalComponentProps}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Link.displayName = 'Link';
export default Link;

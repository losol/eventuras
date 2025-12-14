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

    // Default link styling (when no variant is set)
    const defaultLinkClasses = !variant
      ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-600/30 hover:decoration-blue-800 underline-offset-2 transition-colors'
      : '';

    const textColor =
      onDark || variant === 'button-primary'
        ? 'text-gray-200'
        : variant
        ? 'text-gray-800 dark:text-gray-200'
        : ''; // No text color for default links (uses defaultLinkClasses)

    const blockClass = block ? 'block' : '';
    let variantClasses = '';
    if (variant?.startsWith('button-')) {
      const key = variant.replace('button-', '') as keyof typeof buttonStyles;
      if (buttonStyles[key]) variantClasses = 'px-4 py-2 inline-flex items-center gap-2 whitespace-nowrap ' + buttonStyles[key];
    }

    const classes = [
      spacingClasses,
      defaultLinkClasses,
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

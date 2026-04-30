// core/Link.tsx
import React from 'react';
import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';
import { buttonStyles } from '../Button/Button';
import './Link.css';

export interface LinkProps extends SpacingProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'button-primary' | 'button-secondary' | 'button-light' | 'button-outline' | 'button-text';
  block?: boolean;
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
      block = false,
      variant,
      linkOverlay = false,
      padding, paddingX, paddingY, paddingTop, paddingBottom,
      margin, marginX, marginY, marginTop, marginBottom,
      gap,
      testId,
      ...rest
    },
    ref
  ) => {
    const spacingClasses = buildSpacingClasses({ padding, paddingX, paddingY, paddingTop, paddingBottom, margin, marginX, marginY, marginTop, marginBottom, gap });

    // Default link styling (when no variant or custom className is set)
    const defaultLinkClasses = !variant && !className
      ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-600/30 hover:decoration-blue-800 underline-offset-2 transition-colors'
      : '';

    // Transparent variants (`button-outline`, `button-text`) inherit text
    // color from `--text` so they react to `surface-dark` / `surface-light`
    // on a parent. Filled variants keep the text color shipped by their
    // entry in `buttonStyles`.
    const isTransparentVariant = variant === 'button-outline' || variant === 'button-text';
    const textColor = isTransparentVariant ? 'text-(--text)' : '';

    const blockClass = block ? 'block' : '';
    let variantClasses = '';
    if (variant?.startsWith('button-')) {
      const key = variant.replace('button-', '') as keyof typeof buttonStyles;
      if (buttonStyles[key]) variantClasses = 'px-4 py-2 inline-flex items-center gap-2 whitespace-nowrap ' + buttonStyles[key];
    }

    const classes = cn(
      spacingClasses,
      defaultLinkClasses,
      variantClasses,
      textColor,
      blockClass,
      linkOverlay && 'link-overlay',
      className,
    );

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

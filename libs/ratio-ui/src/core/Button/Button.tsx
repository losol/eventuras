import React, { forwardRef } from 'react';
import { LoaderCircle } from '../../icons';
import { BoxSpacingProps, buildSpacingClasses } from '../../layout/Box/Box';

// Animation constants
const ANIMATION_CLASSES = [
  'transition-all',
  'duration-500',
  'transform',
  'ease-in-out',
  'active:scale-110',
  'hover:shadow-sm',
].join(' ');

export const buttonStyles = {
  primary: `border font-bold bg-primary-700 dark:bg-primary-950 hover:bg-primary-700 text-white rounded-full ${ANIMATION_CLASSES}`,
  secondary:
    `border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400 ` +
    `dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 ` +
    `rounded-full ${ANIMATION_CLASSES}`,
  light: `bg-primary-100 text-gray-800 hover:bg-primary-200 dark:bg-primary-800 dark:text-white ` +
         `dark:hover:bg-primary-700 rounded-full ${ANIMATION_CLASSES}`,
  text:  `bg-transparent hover:bg-primary-200 hover:bg-opacity-20 rounded-full ${ANIMATION_CLASSES}`,
  outline:
    `border border-gray-700 hover:border-primary-500 hover:bg-primary-100/10 dark:hover:bg-primary-900 ` +
    `dark:text-white rounded-full ${ANIMATION_CLASSES}`,
};

export const buttonSizes = {
  sm: 'px-3 py-0.5 text-sm',
  md: 'px-4 py-1 text-base',
  lg: 'px-6 py-2 text-lg',
};

export interface ButtonProps
  extends Omit<BoxSpacingProps, 'padding'>,
          Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  ariaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onDark?: boolean;
  variant?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizes;
  block?: boolean;
  className?: string;
  testId?: string;
  /** Custom padding - overrides size padding if provided */
  padding?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    onDark = false,
    block = false,
    disabled = false,
    loading = false,
    icon,
    children,
    ariaLabel,
    className = '',
    type = 'button',
    onClick,
    // spacing props:
    padding,
    margin = 'm-1',
    border,
    width,
    height,
    testId,
    // all other native button props (e.g. id, name, value)
    ...rest
  },
  ref
) {
  // Use custom padding if provided, otherwise use size-based padding
  const effectivePadding = padding ?? buttonSizes[size];
  const spacingClasses = buildSpacingClasses({ padding: effectivePadding, margin, border, width, height });

  // Get font size from size preset
  const sizeClass = buttonSizes[size].split(' ').find(c => c.startsWith('text-')) ?? '';

  const displayClass    = block ? 'w-full' : '';
  const variantClass = buttonStyles[variant];

  const isTransparent = variant === 'text' || variant === 'outline';
  let textColorClass = '';
  if (isTransparent) {
    textColorClass = onDark
      ? 'text-white'
      : 'text-black dark:text-white';
  }

  const disabledClasses = (disabled || loading) ? 'opacity-75 cursor-not-allowed' : '';

  // combine everything
  const classes = [
    spacingClasses,
    sizeClass,
    displayClass,
    variantClass,
    textColorClass,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      onClick={onClick}
      className={classes}
      data-testid={testId}
      {...rest}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <LoaderCircle
            className="h-4 w-4 animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {!loading && icon && (
          <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </span>
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

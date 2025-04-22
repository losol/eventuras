import React, { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { BoxProps, spacingClassName } from '../../layout/Box/Box';

// Animation constants
const ANIMATION_CLASSES = [
  'transition-all',
  'duration-500',
  'ease-in-out',
  'active:scale-110',
  'hover:shadow-sm',
].join(' ');

export const buttonStyles = {
  defaultPadding: 'px-4 py-1',
  primary: `border font-bold bg-primary-700 dark:bg-primary-950 hover:bg-primary-700 text-white rounded-full ${ANIMATION_CLASSES}`,
  secondary: `border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 rounded-full ${ANIMATION_CLASSES}`,
  light: `bg-primary-100 text-gray-800 hover:bg-primary-200 dark:bg-primary-800 dark:text-white dark:hover:bg-primary-700 rounded-full ${ANIMATION_CLASSES}`,
  text: `bg-transparent hover:bg-primary-200 hover:bg-opacity-20 rounded-full ${ANIMATION_CLASSES}`,
  outline: `border border-gray-700 hover:border-primary-500 hover:bg-primary-100/10 dark:hover:bg-primary-900 dark:text-white rounded-full ${ANIMATION_CLASSES}`,
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BoxProps {
  ariaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onDark?: boolean;
  variant?: keyof typeof buttonStyles;
  block?: boolean;
  ['data-test-id']?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      variant = 'primary',
      onDark = false,
      block = false,
      disabled,
      loading,
      icon,
      children,
      ariaLabel,
      className,
      type = 'button',
      ['data-test-id']: dataTestId,
      ...boxProps
    },
    ref
  ) => {
    const baseStyle = buttonStyles[variant];
    const spacing = spacingClassName(boxProps, {
      defaultPadding: buttonStyles.defaultPadding,
      defaultMargin: 'm-1',
    });

    // inline‐flex for icon + text alignment
    const displayClass = block
      ? 'flex w-full items-center justify-center'
      : 'inline-flex items-center justify-center';

    // only text/outline need inverted text on dark
    const textColorClass =
      (variant === 'text' || variant === 'outline') &&
      (onDark ? 'text-white' : 'text-black dark:text-white');

    const classes = [
      displayClass,
      spacing,
      baseStyle,
      textColorClass,
      'font-medium',
      'transform', // needed for active:scale
      (disabled || loading) && 'opacity-75 cursor-not-allowed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        onClick={onClick}
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={classes}
        type={type}
        data-test-id={dataTestId}
      >
        {loading && (
          <LoaderCircle
            className="h-4 w-4 animate-spin mr-2 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        {!loading && icon && (
          <span className="mr-2 flex-shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

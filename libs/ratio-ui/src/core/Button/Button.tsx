import React, { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { BoxProps, spacingClassName } from '../../layout/Box/Box';

const ANIMATION_DURATION = 'duration-500';
const ANIMATION_TIMING = 'ease-in-out';
const HOVER_SHADOW = 'hover:shadow-sm';
const ACTIVE_SCALE = 'active:scale-120';

// Combined animation constants
const ANIMATION_CLASSES = `transition-all ${ANIMATION_DURATION} ${ANIMATION_TIMING} ${ACTIVE_SCALE} ${HOVER_SHADOW}`;

export const buttonStyles = {
  defaultPadding: 'px-4 py-1',
  primary:
    `border font-bold bg-primary-700 dark:bg-primary-950 hover:bg-primary-700 text-white rounded-full ${ANIMATION_CLASSES}`,
  secondary:
    `border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 rounded-full ${ANIMATION_CLASSES}`,
  light:
    `bg-primary-100 text-gray-800 hover:bg-primary-200 dark:bg-primary-800 dark:text-white dark:hover:bg-primary-700 rounded-full ${ANIMATION_CLASSES}`,
  text:
    `bg-transparent hover:bg-primary-200 hover:bg-opacity-20 rounded-full ${ANIMATION_CLASSES}`,
  outline:
    `border border-gray-700 hover:border-primary-500 hover:bg-primary-100/10 dark:hover:bg-primary-900 dark:text-white rounded-full ${ANIMATION_CLASSES}`,
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BoxProps {
  ariaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onDark?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'light' | 'text';
  block?: boolean;
  ['data-test-id']?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
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

    const display = block
      ? 'flex w-full items-center justify-center'
      : 'inline-flex items-center justify-center';

    const textColorClass = (variant === 'text' || variant === 'outline') && (onDark
      ? 'text-white'
      : 'text-black dark:text-white');

    // Add padding for icon or loader
    const contentPadding = (loading || icon) ? 'pl-8' : '';

    const classes = [
      display,
      spacing,
      baseStyle,
      textColorClass,
      'font-medium',
      'relative',
      'transform',
      block && 'block',
      (disabled || loading) && 'opacity-75',
      (disabled || loading) && 'cursor-not-allowed',
      (disabled || loading) && '!transition-none !transform-none !active:scale-100',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={classes}
        type={type}
        data-test-id={dataTestId}
      >
        {loading && (
          <LoaderCircle
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}
        {!loading && icon && (
          <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform`}>
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

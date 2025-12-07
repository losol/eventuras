import React, { forwardRef } from 'react';
import { LoaderCircle } from '../../icons';
import { BoxSpacingProps, buildSpacingClasses } from '../../layout/Box/Box';
import { defaultButtonPadding } from './Button';

// Animation constants
const ANIMATION_CLASSES = [
  'transition-all',
  'duration-500',
  'transform',
  'ease-in-out',
  'active:scale-110',
  'hover:shadow-sm',
].join(' ');

export interface VippsButtonProps
  extends BoxSpacingProps,
          Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  /** Button text. If not provided, defaults to locale-specific text */
  children?: React.ReactNode;
  /** Locale for default button text ('no', 'nb', 'nn' = Norwegian, others = English) */
  locale?: string;
  /** Show loading state */
  loading?: boolean;
  /** Disable button */
  disabled?: boolean;
  /** Make button full width */
  block?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  testId?: string;
  /** Aria label */
  ariaLabel?: string;
}

const VippsButton = forwardRef<HTMLButtonElement, VippsButtonProps>(function VippsButton(
  {
    children,
    locale = 'en',
    loading = false,
    disabled = false,
    block = false,
    className = '',
    type = 'button',
    ariaLabel,
    testId,
    // spacing props:
    padding = 'p-3',
    margin = 'm-1',
    border,
    width,
    height,
    // all other native button props
    ...rest
  },
  ref
) {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height });

  // Default text based on locale
  const defaultText = ['no', 'nb', 'nn'].includes(locale.toLowerCase())
    ? 'Kjøp nå med Vipps'
    : 'Buy now with Vipps';

  const buttonText = children || defaultText;

  const displayClass = block ? 'w-full' : '';
  const disabledClasses = (disabled || loading) ? 'opacity-75 cursor-not-allowed' : '';

  const classes = [
    spacingClasses,
    displayClass,
    'font-bold',
    'text-white',
    'rounded-full',
    'bg-[var(--color-vipps-orange)]',
    'hover:bg-[var(--color-vipps-hover)]',
    ANIMATION_CLASSES,
    disabledClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof buttonText === 'string' ? buttonText : 'Vipps payment')}
      className={classes}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && (
          <LoaderCircle
            className="h-4 w-4 animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {/* TODO: Add Vipps logo/icon here */}
        <span>{loading ? 'Loading...' : buttonText}</span>
      </div>
    </button>
  );
});

VippsButton.displayName = 'VippsButton';
export default VippsButton;

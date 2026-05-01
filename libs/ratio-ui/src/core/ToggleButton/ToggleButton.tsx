import React from 'react';
import { ToggleButton as AriaToggleButton, ToggleButtonProps as AriaToggleButtonProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'className'> {
  /**
   * The visual style variant of the toggle button
   * - 'default': Standard gray border with blue highlight when selected
   * - 'primary': Blue background when selected
   * - 'outline': Outlined style with border emphasis
   */
  variant?: 'default' | 'primary' | 'outline';

  /**
   * Additional CSS classes to apply
   */
  className?: string;

  /**
   * Content to display inside the button
   */
  children: React.ReactNode;
}

const variantStyles = {
  default: {
    base: 'border-2 border-border-1 bg-card',
    hover: 'hover:border-(--primary) hover:bg-card-hover',
    selected: 'border-(--primary) bg-primary-100 dark:bg-primary-800 shadow-sm',
    pressed: 'pressed:scale-95',
  },
  primary: {
    base: 'border-2 border-border-1 bg-card',
    hover: 'hover:bg-card-hover',
    selected: 'border-(--primary) bg-(--primary) text-(--text-on-primary) shadow-md',
    pressed: 'pressed:scale-95',
  },
  outline: {
    base: 'border-2 border-border-2 bg-transparent',
    hover: 'hover:border-(--primary) hover:bg-card-hover',
    selected: 'border-(--primary) bg-primary-100 dark:bg-primary-800',
    pressed: 'pressed:scale-95',
  },
};

/**
 * ToggleButton component based on React Aria Components
 *
 * A button that can be toggled between selected and unselected states.
 * Provides built-in accessibility features including proper ARIA attributes,
 * keyboard navigation, and focus management.
 *
 * @example
 * ```tsx
 * <ToggleButton>
 *   Toggle me
 * </ToggleButton>
 *
 * <ToggleButton isSelected variant="primary">
 *   Selected
 * </ToggleButton>
 * ```
 */
export const ToggleButton: React.FC<ToggleButtonProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <AriaToggleButton
      {...props}
      className={({ isSelected, isPressed, isHovered, isFocusVisible }) => {
        const classes = [
          // Base styles
          'px-4 py-2 rounded-lg',
          'transition-all duration-200',
          'cursor-pointer',
          'outline-none',

          // Variant base
          styles.base,

          // State-dependent styles
          isSelected ? styles.selected : styles.hover,
          isPressed && styles.pressed,

          // Focus visible ring
          isFocusVisible && 'ring-2 ring-(--focus-ring) ring-offset-2',

          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Custom classes
          className,
        ];

        return cn(...classes);
      }}
    >
      {children}
    </AriaToggleButton>
  );
};

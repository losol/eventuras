import React from 'react';
import { ToggleButton as AriaToggleButton, ToggleButtonProps as AriaToggleButtonProps } from 'react-aria-components';

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
    base: 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    hover: 'hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700',
    selected: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm',
    pressed: 'pressed:scale-95',
  },
  primary: {
    base: 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    selected: 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700 shadow-md',
    pressed: 'pressed:scale-95',
  },
  outline: {
    base: 'border-2 border-gray-400 dark:border-gray-500 bg-transparent',
    hover: 'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
    selected: 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30',
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
          isFocusVisible && 'ring-2 ring-blue-500 ring-offset-2',

          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Custom classes
          className,
        ];

        return classes.filter(Boolean).join(' ');
      }}
    >
      {children}
    </AriaToggleButton>
  );
};

export default ToggleButton;

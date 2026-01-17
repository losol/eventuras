import { Label as AriaLabel } from 'react-aria-components';
import type { ComponentProps } from 'react';

const styles = {
  label: 'block font-bold mb-2',
};

/**
 * Label component with ratio-ui default styling.
 *
 * Built on React Aria's Label component for proper accessibility.
 * Uses the standard ratio-ui label style: 'block font-bold mb-2'.
 *
 * If no children are provided, returns null to avoid rendering an empty label.
 *
 * Can be used standalone with htmlFor, or as part of React Aria form field components
 * where it automatically associates with the input via context.
 *
 * @example
 * // With React Aria components (automatic association)
 * ```tsx
 * <TextField>
 *   <Label>Email Address</Label>
 *   <Input />
 * </TextField>
 * ```
 *
 * @example
 * // Standalone with htmlFor
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <input id="email" type="email" />
 * ```
 *
 * @example
 * // Custom styling
 * ```tsx
 * <Label className="text-lg text-blue-600">Custom Label</Label>
 * ```
 */
export function Label({ children, className, ...props }: ComponentProps<typeof AriaLabel>) {
  if (!children) return null;

  return (
    <AriaLabel
      className={className ?? styles.label}
      {...props}
    />
  );
}

/**
 * @deprecated Use `Label` instead. This export is kept for backward compatibility.
 */
export const InputLabel = Label;

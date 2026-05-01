import { Input as AriaInput } from 'react-aria-components';
import type { ComponentPropsWithRef } from 'react';

/**
 * Default input styles for React Aria components
 * Lighter design suitable for autocomplete, combobox, and similar compact inputs
 */
export const inputStyles = {
  default:
    'px-3 py-2 border border-border-1 rounded-lg bg-card text-(--text) focus:outline-none focus:ring-2 focus:ring-(--focus-ring)',
};

/**
 * Input component - A simple styled input primitive based on React Aria.
 *
 * This is a lightweight, composable input element that can be used:
 * - Standalone with forms
 * - Within React Aria components (SearchField, TextField, etc.)
 * - As part of custom form compositions
 *
 * For a complete form field with label, description, and errors, use `TextField`.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <Input placeholder="Enter your name" />
 * ```
 *
 * @example
 * // With custom styling
 * <Input className="w-full px-4 py-3" placeholder="Custom styled" />
 * ```
 *
 * @example
 * // Within React Aria SearchField
 * <SearchField>
 *   <Label>Search</Label>
 *   <Input placeholder="Type to search..." />
 * </SearchField>
 * ```
 */
export function Input({ className, ref, ...props }: ComponentPropsWithRef<typeof AriaInput>) {
  return <AriaInput ref={ref} className={className ?? inputStyles.default} {...props} />;
}

import { Input as AriaInput } from 'react-aria-components';
import type { ComponentProps } from 'react';

/**
 * Default input styles for React Aria components
 * Lighter design suitable for autocomplete, combobox, and similar compact inputs
 */
export const inputStyles = {
  default:
    'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
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
export function Input({ className, ...props }: ComponentProps<typeof AriaInput>) {
  return <AriaInput className={className ?? inputStyles.default} {...props} />;
}

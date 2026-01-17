'use client';

import {
  SearchField as AriaSearchField,
  Label as AriaLabel,
  Input as AriaInput,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
} from 'react-aria-components';
import type { ComponentProps } from 'react';

/**
 * Styled Label with ratio-ui defaults
 */
export function Label({ className, ...props }: ComponentProps<typeof AriaLabel>) {
  return (
    <AriaLabel
      className={className ?? 'block font-bold mb-2'}
      {...props}
    />
  );
}

/**
 * Styled Input with ratio-ui defaults
 */
export function Input({ className, ...props }: ComponentProps<typeof AriaInput>) {
  return (
    <AriaInput
      className={
        className ??
        'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
      }
      {...props}
    />
  );
}

/**
 * Styled ListBox with ratio-ui defaults
 */
export function ListBox({ className, ...props }: ComponentProps<typeof AriaListBox>) {
  return (
    <AriaListBox
      className={
        className ??
        'mt-1 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto'
      }
      {...props}
    />
  );
}

/**
 * Styled ListBoxItem with ratio-ui defaults
 */
export function ListBoxItem({ className, ...props }: ComponentProps<typeof AriaListBoxItem>) {
  return (
    <AriaListBoxItem
      className={
        className ??
        'px-3 py-2 cursor-pointer outline-none rounded text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-600 selected:bg-blue-500 selected:text-white'
      }
      {...props}
    />
  );
}

/**
 * Re-export SearchField as-is (already has good defaults from React Aria)
 */
export { AriaSearchField as SearchField };

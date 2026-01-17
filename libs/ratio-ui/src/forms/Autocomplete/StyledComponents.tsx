'use client';

import {
  SearchField as AriaSearchField,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
} from 'react-aria-components';
import type { ComponentProps } from 'react';
import { Label } from '../common/Label';
import { Input } from '../Input/Input';

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
 * Re-export Label and Input from common (shared across all form components)
 */
export { Label, Input };

/**
 * Re-export SearchField as-is (already has good defaults from React Aria)
 */
export { AriaSearchField as SearchField };

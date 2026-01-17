'use client';

import { ListBox as AriaListBox, ListBoxItem as AriaListBoxItem } from 'react-aria-components';
import type { ComponentProps } from 'react';

export type ListBoxProps = ComponentProps<typeof AriaListBox>;
export type ListBoxItemProps = ComponentProps<typeof AriaListBoxItem>;

/**
 * ListBox with ratio-ui defaults
 */
export function ListBox({ className, ...props }: ListBoxProps) {
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
 * ListBoxItem with ratio-ui defaults
 */
export function ListBoxItem({ className, ...props }: ListBoxItemProps) {
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

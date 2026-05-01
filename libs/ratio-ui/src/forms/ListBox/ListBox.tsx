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
        'mt-1 p-1 bg-card border border-border-1 rounded-lg shadow-lg max-h-60 overflow-auto'
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
        'px-3 py-2 cursor-pointer outline-none rounded text-(--text) hover:bg-card-hover focus:bg-card-hover selected:bg-(--primary) selected:text-(--text-on-primary)'
      }
      {...props}
    />
  );
}

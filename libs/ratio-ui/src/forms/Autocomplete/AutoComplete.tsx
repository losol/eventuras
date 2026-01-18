'use client';

import { Autocomplete as AriaAutocomplete } from 'react-aria-components';
import type { ReactNode } from 'react';
import type { Selection } from 'react-aria-components';

export interface AutoCompleteProps {
  /**
   * The children to render inside the autocomplete.
   * Must include a TextField/SearchField and a collection (ListBox, Menu, etc.)
   */
  readonly children: ReactNode;

  /**
   * The current input value (controlled).
   */
  readonly inputValue?: string;

  /**
   * Handler called when the input value changes.
   */
  readonly onInputChange?: (value: string) => void;

  /**
   * Optional filter function for client-side filtering.
   * When omitted, filtering is expected to be handled by the consumer (e.g., async).
   */
  readonly filter?: (textValue: string, inputValue: string, node: any) => boolean;

  /**
   * Whether to auto-focus the first item after filtering.
   * @default false
   */
  readonly disableAutoFocusFirst?: boolean;

  /**
   * Whether to disable virtual focus (makes collection directly tabbable).
   * @default false
   */
  readonly disableVirtualFocus?: boolean;

  /**
   * Optional loading state indicator.
   * Consumers can use this to show loading UI in their children.
   * Note: This prop is not used by AutoComplete itself, it's for consumer convenience.
   */
  readonly isLoading?: boolean;

  /**
   * Selection mode for the collection.
   * Note: This should be passed to the child ListBox/collection component, not AutoComplete.
   */
  readonly selectionMode?: 'none' | 'single' | 'multiple';

  /**
   * Handler called when selection changes.
   * Note: This should be passed to the child ListBox/collection component, not AutoComplete.
   */
  readonly onSelectionChange?: (keys: Selection) => void;
}

/**
 * AutoComplete component following React Aria patterns.
 *
 * A composable autocomplete that wraps a SearchField/TextField and a collection component
 * (ListBox, Menu, etc.) to provide filtering and selection behavior.
 *
 * @example
 * ```tsx
 * // Async search pattern
 * const list = useAsyncList({
 *   async load({ filterText }) {
 *     if (!filterText || filterText.length < 3) return { items: [] };
 *     const results = await searchAPI(filterText);
 *     return { items: results };
 *   }
 * });
 *
 * <AutoComplete
 *   inputValue={list.filterText}
 *   onInputChange={list.setFilterText}
 *   isLoading={list.isLoading}
 * >
 *   <SearchField label="Search" placeholder="Type to search..." />
 *   <ListBox items={list.items} renderEmptyState={() => 'No results'}>
 *     {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
 *   </ListBox>
 * </AutoComplete>
 * ```
 *
 * @see https://react-aria.adobe.com/Autocomplete.html
 */
export function AutoComplete({
  children,
  inputValue,
  onInputChange,
  filter,
  disableAutoFocusFirst = false,
  disableVirtualFocus = false,
}: AutoCompleteProps) {
  return (
    <AriaAutocomplete
      inputValue={inputValue}
      onInputChange={onInputChange}
      filter={filter}
      disableAutoFocusFirst={disableAutoFocusFirst}
      disableVirtualFocus={disableVirtualFocus}
    >
      {children}
    </AriaAutocomplete>
  );
}

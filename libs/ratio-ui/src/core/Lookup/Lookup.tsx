'use client';

import { useState, type ReactNode } from 'react';
import {
  Button,
  Input,
  Label,
  type Key,
  type Selection,
} from 'react-aria-components';
import { useAsyncList } from 'react-stately';

import { AutoComplete } from '../../forms/Autocomplete/AutoComplete';
import { ListBox, ListBoxItem, SearchField } from '../../forms/Autocomplete/StyledComponents';
import { X } from '../../icons';

export interface LookupProps<T> {
  /** Label shown above the input. */
  readonly label: string;
  /** Placeholder for the input. */
  readonly placeholder?: string;
  /**
   * Minimum number of characters required before `load` is called. Below the
   * threshold, the list renders `minCharsMessage` (or a default) instead.
   * @default 0
   */
  readonly minChars?: number;
  /**
   * Async loader. Called with the current query whenever the user types, as
   * long as the query is at least `minChars` long. An optional `AbortSignal`
   * is forwarded from `useAsyncList` so consumers can cancel in-flight
   * requests when the query changes. Should return an array of items (empty
   * array on error — the consumer handles error reporting).
   */
  readonly load: (query: string, signal?: AbortSignal) => Promise<T[]>;
  /** Return a unique, stable key for an item. */
  readonly getItemKey: (item: T) => Key;
  /**
   * Return the short label shown in the input after an item is selected. Also
   * used as the default text value for accessibility/type-ahead.
   */
  readonly getItemLabel: (item: T) => string;
  /**
   * Return the text value used by react-aria for screen readers and
   * type-ahead matching. Defaults to `getItemLabel`.
   */
  readonly getItemTextValue?: (item: T) => string;
  /** Render the visible content of each item in the list. */
  readonly renderItem: (item: T) => ReactNode;
  /** Called when the user selects an item. */
  readonly onItemSelected: (item: T) => void;
  /**
   * Message shown when the query is long enough but there are no results.
   * @default 'No results'
   */
  readonly emptyState?: string;
  /**
   * Message shown when the user has not typed enough characters. Defaults to
   * a message derived from `minChars`.
   */
  readonly minCharsMessage?: string;
  /** Extra class for the input. */
  readonly inputClassName?: string;
  /** Extra class for the list container. */
  readonly listClassName?: string;
  /**
   * `id` for the underlying `<input>` element. Use this when an external
   * `<label htmlFor="...">` needs to be associated with the field.
   */
  readonly inputId?: string;
}

/**
 * Inline typeahead picker: search asynchronously, navigate results with the
 * keyboard, pick one to trigger an action. Used for "add user to event",
 * "select event", and similar lookup flows where the user is *finding* an
 * existing entity, not filling in a form field.
 *
 * Built on react-aria's `Autocomplete` + `ListBox` + `useAsyncList` and
 * handles the common concerns: loading spinner, min-char threshold, deduping
 * re-queries after selection, and rendering empty/placeholder states.
 *
 * For a modal / Cmd+K variant see `CommandPalette`.
 *
 * @example
 * ```tsx
 * <Lookup<UserDto>
 *   label="Search User"
 *   placeholder="Search by name or email (min 3 characters)"
 *   minChars={3}
 *   load={searchUsers}
 *   getItemKey={u => u.id!}
 *   getItemLabel={u => u.name ?? ''}
 *   getItemTextValue={u => `${u.name} ${u.email}`}
 *   renderItem={u => (
 *     <>
 *       <div className="font-medium">{u.name}</div>
 *       <div className="text-sm text-gray-600">{u.email}</div>
 *     </>
 *   )}
 *   onItemSelected={u => setSelected(u)}
 *   emptyState="No users found"
 * />
 * ```
 */
export function Lookup<T>({
  label,
  placeholder,
  minChars = 0,
  load,
  getItemKey,
  getItemLabel,
  getItemTextValue,
  renderItem,
  onItemSelected,
  emptyState = 'No results',
  minCharsMessage,
  inputClassName,
  listClassName,
  inputId,
}: LookupProps<T>) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const list = useAsyncList<T>({
    getKey: getItemKey,
    async load({ filterText, signal }) {
      // Skip re-querying when the input already matches the just-selected
      // item's label — otherwise selecting an item would immediately refetch.
      if (selectedLabel && filterText === selectedLabel) {
        return { items: [] };
      }
      if (!filterText || filterText.length < minChars) {
        return { items: [] };
      }
      try {
        const items = await load(filterText, signal);
        return { items };
      } catch {
        // Consumer is responsible for error reporting inside `load`; we
        // swallow here so the list simply shows the empty state.
        return { items: [] };
      }
    },
  });

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    const key = keys.values().next().value;
    if (key === undefined) return;
    const item = list.items.find(i => getItemKey(i) === key);
    if (!item) return;

    onItemSelected(item);

    const newLabel = getItemLabel(item).trim();
    if (newLabel) {
      setSelectedLabel(newLabel);
      list.setFilterText(newLabel);
    }
  };

  const textValueOf = getItemTextValue ?? getItemLabel;
  const resolvedMinCharsMessage =
    minCharsMessage ??
    (minChars > 0
      ? `Type at least ${minChars} character${minChars === 1 ? '' : 's'} to search`
      : undefined);

  const clearInput = () => {
    setSelectedLabel(null);
    list.setFilterText('');
  };

  // Hide the result list entirely when:
  //   - the input is empty (nothing to search for), or
  //   - the input matches the just-selected item's label (avoids showing a
  //     stray "No results" row right after picking something).
  // The list is *also* shown while below the min-char threshold, so users
  // see the "type at least N characters" hint as soon as they start typing.
  const trimmedFilter = list.filterText.trim();
  const isJustSelected = selectedLabel !== null && trimmedFilter === selectedLabel;
  const shouldShowList = trimmedFilter.length > 0 && !isJustSelected;
  const belowMinChars = trimmedFilter.length < minChars;

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={value => {
        if (selectedLabel && value !== selectedLabel) {
          setSelectedLabel(null);
        }
        list.setFilterText(value);
      }}
      isLoading={list.isLoading}
    >
      <SearchField className="group flex flex-col gap-1">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</Label>
        <div className="relative">
          <Input
            id={inputId}
            className={
              inputClassName ??
              'w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }
            placeholder={placeholder}
          />
          {list.isLoading && (
            <div className="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
          {/*
           * Clear button is always mounted so react-aria's SearchField can
           * keep its reference stable. Hidden via CSS (data-empty attribute
           * set by SearchField) when the input is empty. We wire `onPress`
           * explicitly so clearing also resets `selectedLabel` — relying on
           * react-aria's implicit `clearButtonProps` context wouldn't reset
           * our local "just-selected" state.
           */}
          <Button
            aria-label="Clear search"
            onPress={clearInput}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 group-data-empty:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SearchField>
      {shouldShowList && (
        <ListBox
          items={list.items as Iterable<T & { id?: Key; }>}
          className={
            listClassName ??
            'mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto outline-none'
          }
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          renderEmptyState={() => (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {belowMinChars && resolvedMinCharsMessage ? resolvedMinCharsMessage : emptyState}
            </div>
          )}
        >
          {item => {
            const typed = item as T;
            return (
              <ListBoxItem
                id={getItemKey(typed)}
                textValue={textValueOf(typed)}
                className="px-3 py-2 cursor-pointer outline-none rounded text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-600 selected:bg-blue-500 selected:text-white"
              >
                {renderItem(typed)}
              </ListBoxItem>
            );
          }}
        </ListBox>
      )}
    </AutoComplete>
  );
}

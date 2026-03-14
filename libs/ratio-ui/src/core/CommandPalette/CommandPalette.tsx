'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search as SearchIcon } from '../../icons';
import { Kbd } from '../Kbd';

export interface CommandPaletteItem {
  id: string;
  title: string;
  descriptionHtml?: string;
}

export interface CommandPaletteProps {
  /** Items to display in the results list */
  items: CommandPaletteItem[];
  /** Called when an item is selected (click or Enter) */
  onSelect: (item: CommandPaletteItem) => void;
  /** Called when the input query changes */
  onQueryChange: (query: string) => void;
  /** Placeholder for the search input */
  placeholder?: string;
  /** Global keyboard shortcut to open (default: Cmd+K / Ctrl+K) */
  shortcut?: 'cmd+k' | 'cmd+j' | 'cmd+p';
  /** Keyboard shortcut hint displayed on trigger button */
  shortcutHint?: string;
  /** Message when query is entered but no items match. {query} is replaced with the current query */
  emptyMessage?: string;
  className?: string;
}

const SHORTCUT_KEYS: Record<string, string> = {
  'cmd+k': 'k',
  'cmd+j': 'j',
  'cmd+p': 'p',
};

/**
 * Command palette with trigger button, search input, keyboard navigation,
 * and result list. Implements the combobox + listbox ARIA pattern.
 *
 * Register a global keyboard shortcut (default Cmd+K) to open.
 */
export function CommandPalette({
  items,
  onSelect,
  onQueryChange,
  placeholder = 'Search...',
  shortcut = 'cmd+k',
  shortcutHint = '⌘K',
  emptyMessage = 'No results for \u201c{query}\u201d',
  className = '',
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Global keyboard shortcut
  useEffect(() => {
    const key = SHORTCUT_KEYS[shortcut];
    if (!key) return;

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === key) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcut]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setActiveIndex(0);
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(0);
      onQueryChange(value);
    },
    [onQueryChange],
  );

  const handleSelect = useCallback(
    (item: CommandPaletteItem) => {
      onSelect(item);
      close();
    },
    [onSelect, close],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      return;
    }

    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault();
      handleSelect(items[activeIndex]);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={open}
        className={`flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300 ${className}`}
        aria-label={placeholder}
      >
        <SearchIcon aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{placeholder}</span>
        {shortcutHint && <Kbd className="hidden sm:inline-flex">{shortcutHint}</Kbd>}
      </button>

      {/* Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
          role="presentation"
        >
          <div
            aria-label={placeholder}
            aria-modal="true"
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800"
            role="dialog"
          >
            {/* Input */}
            <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
              <SearchIcon aria-hidden="true" className="mr-3 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                aria-autocomplete="list"
                aria-controls="command-palette-results"
                aria-expanded={items.length > 0}
                className="w-full bg-transparent py-4 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                role="combobox"
                type="search"
                value={query}
              />
              <Kbd className="ml-2">esc</Kbd>
            </div>

            {/* Results */}
            {items.length > 0 && (
              <ul
                className="max-h-80 overflow-y-auto p-2"
                id="command-palette-results"
                role="listbox"
              >
                {items.map((item, i) => (
                  <li
                    key={item.id}
                    aria-selected={i === activeIndex}
                    className={`cursor-pointer rounded-lg px-4 py-3 ${
                      i === activeIndex
                        ? 'bg-primary-50 dark:bg-primary-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => handleSelect(item)}
                    role="option"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    {item.descriptionHtml && (
                      <div
                        className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: item.descriptionHtml }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Empty state */}
            {query && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {emptyMessage.replace('{query}', query)}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

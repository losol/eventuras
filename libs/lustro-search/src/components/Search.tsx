'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Kbd } from '@eventuras/ratio-ui/core/Kbd';
import { Search as SearchIcon } from '@eventuras/ratio-ui/icons';

import type { SearchProvider, SearchResult } from '../types.js';

interface SearchProps {
  /** Search provider instance (e.g. OramaProvider) */
  provider: SearchProvider;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Custom navigation handler for SPA routers (e.g. Next.js router.push) */
  onNavigate?: (url: string) => void;
}

/**
 * Full-text search dialog triggered by Cmd+K / Ctrl+K.
 *
 * Uses a SearchProvider for the actual search so the underlying
 * engine can be swapped without changing consuming code.
 */
export function Search({ provider, placeholder = 'Search...', onNavigate }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const searchIdRef = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const navigate = useCallback(
    (url: string) => {
      if (onNavigate) {
        onNavigate(url);
      } else {
        window.location.href = url;
      }
      setIsOpen(false);
    },
    [onNavigate],
  );

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus management: trap focus in dialog, restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Debounced search with stale-response protection
  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(0);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults([]);
        return;
      }

      const requestId = ++searchIdRef.current;

      debounceRef.current = setTimeout(async () => {
        const hits = await provider.search(value);
        // Ignore stale responses from earlier queries
        if (requestId === searchIdRef.current) {
          setResults(hits);
        }
      }, 200);
    },
    [provider],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) {
      if (e.key === 'Escape') setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].url);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
        aria-label="Search"
      >
        <SearchIcon aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{placeholder}</span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </button>

      {/* Search dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          role="presentation"
        >
          <div
            ref={dialogRef}
            aria-label="Search"
            aria-modal="true"
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800"
            role="dialog"
          >
            {/* Search input */}
            <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
              <SearchIcon aria-hidden="true" className="mr-3 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                aria-autocomplete="list"
                aria-controls="lustro-search-results"
                aria-expanded={results.length > 0}
                className="w-full bg-transparent py-4 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                role="combobox"
                type="search"
                value={query}
              />
              <Kbd className="ml-2">esc</Kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto p-2" id="lustro-search-results" role="listbox">
                {results.map((result, i) => (
                  <li
                    key={result.url}
                    aria-selected={i === activeIndex}
                    className={`cursor-pointer rounded-lg px-4 py-3 ${
                      i === activeIndex
                        ? 'bg-primary-50 dark:bg-primary-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => navigate(result.url)}
                    role="option"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </div>
                    <div
                      className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: result.excerptHtml }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* Empty state */}
            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

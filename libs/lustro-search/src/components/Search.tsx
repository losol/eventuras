'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { SearchProvider, SearchResult } from '../types.js';

interface SearchProps {
  /** Search provider instance (e.g. OramaProvider) */
  provider: SearchProvider;
  /** Placeholder text for the input */
  placeholder?: string;
}

/**
 * Full-text search dialog triggered by Cmd+K / Ctrl+K.
 *
 * Uses a SearchProvider for the actual search so the underlying
 * engine can be swapped without changing consuming code.
 */
export function Search({ provider, placeholder = 'Search...' }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(0);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        const hits = await provider.search(value);
        setResults(hits);
      }, 200);
    },
    [provider],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      window.location.href = results[activeIndex].url;
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
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
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-slate-800">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-4 dark:border-slate-700">
          <svg
            className="mr-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <input
            ref={inputRef}
            className="w-full bg-transparent py-4 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-slate-500"
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            type="search"
            value={query}
          />
          <kbd className="ml-2 rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 dark:border-slate-600">
            esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto p-2">
            {results.map((result, i) => (
              <li key={result.url}>
                <a
                  className={`block rounded-lg px-4 py-3 ${
                    i === activeIndex
                      ? 'bg-blue-50 dark:bg-slate-700'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                  href={result.url}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.title}
                  </div>
                  <div
                    className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

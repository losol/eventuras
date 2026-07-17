'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { SearchProvider, SearchResult } from '../types.js';

export interface UseDocsSearchOptions {
  /** Search provider instance (e.g. OramaProvider) */
  provider: SearchProvider;
  /** Debounce delay in milliseconds before querying (default: 200) */
  debounceMs?: number;
  /** Custom navigation handler for SPA routers (e.g. Next.js router.push) */
  onNavigate?: (url: string) => void;
}

export interface UseDocsSearchResult {
  /** Latest results for the most recent query */
  results: SearchResult[];
  /** Feed the query on every keystroke; debounced internally */
  onQueryChange: (query: string) => void;
  /** Navigate to a result URL (uses onNavigate if given, else window.location) */
  onSelect: (url: string) => void;
}

/**
 * Headless full-text search: debounced querying against a SearchProvider with
 * stale-response protection. UI-agnostic — render the returned results with any
 * component (e.g. the ratio-ui-based Search, or your own design system).
 */
export function useDocsSearch({
  provider,
  debounceMs = 200,
  onNavigate,
}: UseDocsSearchOptions): UseDocsSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  const onQueryChange = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Bump the id on every change so any in-flight response is ignored —
      // including when the query is cleared.
      const requestId = ++searchIdRef.current;

      if (!query.trim()) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const hits = await provider.search(query);
          if (requestId === searchIdRef.current) {
            setResults(hits);
          }
        } catch {
          if (requestId === searchIdRef.current) {
            setResults([]);
          }
        }
      }, debounceMs);
    },
    [provider, debounceMs],
  );

  // On unmount, cancel the timer and invalidate any in-flight request so a late
  // response can't call setResults after the component is gone.
  useEffect(() => {
    return () => {
      searchIdRef.current++;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onSelect = useCallback(
    (url: string) => {
      if (onNavigate) {
        onNavigate(url);
      } else {
        window.location.href = url;
      }
    },
    [onNavigate],
  );

  return { results, onQueryChange, onSelect };
}

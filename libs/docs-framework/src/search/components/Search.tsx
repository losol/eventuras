'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  CommandPalette,
  type CommandPaletteItem,
} from '@eventuras/ratio-ui/core/CommandPalette';

import type { SearchProvider, SearchResult } from '../types.js';

interface SearchProps {
  /** Search provider instance (e.g. OramaProvider) */
  provider: SearchProvider;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Custom navigation handler for SPA routers (e.g. Next.js router.push) */
  onNavigate?: (url: string) => void;
}

function toItems(results: SearchResult[]): CommandPaletteItem[] {
  return results.map((r) => ({
    id: r.url,
    title: r.title,
    descriptionHtml: r.excerptHtml,
  }));
}

/**
 * Full-text search powered by a SearchProvider, rendered via CommandPalette.
 *
 * Handles debounced async search with stale-response protection.
 */
export function Search({ provider, placeholder = 'Search...', onNavigate }: Readonly<SearchProps>) {
  const [items, setItems] = useState<CommandPaletteItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const searchIdRef = useRef(0);

  const handleQueryChange = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!query.trim()) {
        setItems([]);
        return;
      }

      const requestId = ++searchIdRef.current;

      debounceRef.current = setTimeout(async () => {
        const hits = await provider.search(query);
        if (requestId === searchIdRef.current) {
          setItems(toItems(hits));
        }
      }, 200);
    },
    [provider],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelect = useCallback(
    (item: CommandPaletteItem) => {
      if (onNavigate) {
        onNavigate(item.id);
      } else {
        window.location.href = item.id;
      }
    },
    [onNavigate],
  );

  return (
    <CommandPalette
      items={items}
      onSelect={handleSelect}
      onQueryChange={handleQueryChange}
      placeholder={placeholder}
    />
  );
}

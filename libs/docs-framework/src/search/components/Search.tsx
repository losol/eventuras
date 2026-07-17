'use client';

import {
  CommandPalette,
  type CommandPaletteItem,
} from '@eventuras/ratio-ui/core/CommandPalette';

import type { SearchProvider, SearchResult } from '../types.js';
import { useDocsSearch } from '../hooks/use-docs-search.js';

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
 * Full-text search rendered via the ratio-ui CommandPalette.
 *
 * A thin wrapper over {@link useDocsSearch} — swap this component to render the
 * same search logic with a different design system.
 */
export function Search({ provider, placeholder = 'Search...', onNavigate }: Readonly<SearchProps>) {
  const { results, onQueryChange, onSelect } = useDocsSearch({ provider, onNavigate });

  return (
    <CommandPalette
      items={toItems(results)}
      onSelect={(item) => onSelect(item.id)}
      onQueryChange={onQueryChange}
      placeholder={placeholder}
    />
  );
}

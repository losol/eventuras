import type { SearchProvider, SearchResult } from './types.js';

/**
 * Search provider backed by Orama.
 *
 * In the browser it fetches a pre-built JSON index and restores it.
 * Works for both static docs sites and dynamic web apps.
 */
export class OramaProvider implements SearchProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Orama's deep generics cause TS2589
  private db: any = null;
  private initPromise: Promise<void> | null = null;
  private readonly indexPath: string;

  /**
   * @param indexPath URL or path to the serialized Orama index JSON
   *                  (e.g. "/search-index.json" for docs sites)
   */
  constructor(indexPath = '/search-index.json') {
    this.indexPath = indexPath;
  }

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    const { restore } = await import('@orama/plugin-data-persistence');

    const response = await fetch(this.indexPath);
    if (!response.ok) {
      throw new Error(`Failed to load search index from ${this.indexPath}: ${response.status} ${response.statusText}`);
    }

    const snapshot = await response.json();
    this.db = await restore('json', snapshot);
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.db) await this.init();

    const { search } = await import('@orama/orama');

    const response = search(this.db, {
      term: query,
      limit: 10,
      boost: { title: 2 },
    }) as { hits: Array<{ document: { title: string; content: string; url: string } }> };

    return response.hits.map((hit) => ({
      url: hit.document.url,
      title: hit.document.title,
      excerptHtml: buildExcerpt(hit.document.content, query),
    }));
  }
}

/** Escape HTML entities so indexed content can't inject markup */
function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Build a short excerpt from content, highlighting the area around the first match.
 * Content is HTML-escaped before <mark> tags are inserted.
 */
function buildExcerpt(content: string, query: string, contextChars = 120): string {
  const lower = content.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  let matchIndex = -1;
  for (const term of terms) {
    matchIndex = lower.indexOf(term);
    if (matchIndex !== -1) break;
  }

  if (matchIndex === -1) {
    const raw = content.slice(0, contextChars * 2);
    return escapeHtml(raw) + (content.length > contextChars * 2 ? '...' : '');
  }

  const start = Math.max(0, matchIndex - contextChars);
  const end = Math.min(content.length, matchIndex + contextChars);
  let excerpt = content.slice(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';

  // Escape HTML first, then wrap matching terms in <mark>
  excerpt = escapeHtml(excerpt);
  for (const term of terms) {
    const escaped = escapeHtml(term);
    const regex = new RegExp(`(${escaped.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)})`, 'gi');
    excerpt = excerpt.replace(regex, '<mark>$1</mark>');
  }

  return excerpt;
}

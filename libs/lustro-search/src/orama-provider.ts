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
  private indexPath: string;

  /**
   * @param indexPath URL or path to the serialized Orama index JSON
   *                  (e.g. "/search-index.json" for docs sites)
   */
  constructor(indexPath = '/search-index.json') {
    this.indexPath = indexPath;
  }

  async init(): Promise<void> {
    if (this.db) return;

    const { restore } = await import('@orama/plugin-data-persistence');

    const response = await fetch(this.indexPath);
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
      excerpt: buildExcerpt(hit.document.content, query),
    }));
  }
}

/**
 * Build a short excerpt from content, highlighting the area around the first match.
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
    return content.slice(0, contextChars * 2) + (content.length > contextChars * 2 ? '...' : '');
  }

  const start = Math.max(0, matchIndex - contextChars);
  const end = Math.min(content.length, matchIndex + contextChars);
  let excerpt = content.slice(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';

  // Wrap matching terms in <mark> for highlighting
  for (const term of terms) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    excerpt = excerpt.replace(regex, '<mark>$1</mark>');
  }

  return excerpt;
}

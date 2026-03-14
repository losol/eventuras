export interface SearchResult {
  /** URL path to the matching page */
  url: string;
  /** Page title */
  title: string;
  /** Highlighted excerpt as sanitized HTML (only <mark> tags for highlighting) */
  excerptHtml: string;
}

export interface SearchProvider {
  /** One-time setup (e.g. loading an index, connecting to a service) */
  init(): Promise<void>;
  /** Run a full-text search and return results */
  search(query: string): Promise<SearchResult[]>;
}

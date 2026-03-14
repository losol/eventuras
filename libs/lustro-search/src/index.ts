/**
 * @eventuras/lustro-search
 *
 * Full-text search abstraction powered by Orama.
 * Shared across docs, web, and other apps in the eventuras monorepo.
 *
 * "Lustro" — from Latin lustrare: to examine, explore, illuminate.
 */

export type { SearchProvider, SearchResult } from './types.js';
export { OramaProvider } from './orama-provider.js';
export { DOCS_SCHEMA } from './schema.js';

// buildSearchIndex is available via the separate './build-index' entry point
// to avoid pulling node:fs into browser bundles.

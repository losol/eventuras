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
export { buildSearchIndex } from './build-index.js';

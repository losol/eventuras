/**
 * Payload SEO Plugin - Internal Library
 *
 * Provides reusable SEO meta fields for Payload CMS collections.
 * This is a simple, framework-agnostic approach to managing SEO metadata
 * without the overhead of external plugins.
 *
 * ## Usage
 *
 * ### Add SEO tab to a collection
 *
 * ```typescript
 * import { seoTab } from '@/lib/payload-plugin-seo';
 *
 * export const Articles: CollectionConfig = {
 *   slug: 'articles',
 *   fields: [
 *     // ... other fields
 *     seoTab('no'), // Localized tab label
 *   ],
 * };
 * ```
 *
 * ### Add meta fields inline (without tab)
 *
 * ```typescript
 * import { metaField } from '@/lib/payload-plugin-seo';
 *
 * export const MyCollection: CollectionConfig = {
 *   slug: 'my-collection',
 *   fields: [
 *     // ... other fields
 *     metaField,
 *   ],
 * };
 * ```
 *
 * ## Features
 *
 * - **Title** (max 60 chars) - Optimized for search results
 * - **Description** (max 160 chars) - Snippet text
 * - **Image** - Social sharing image (socialShare format recommended)
 * - **Localized** - Title and description support i18n
 * - **Fallbacks** - Empty fields auto-generate from content
 *
 * ## Future Migration
 *
 * When mature and tested, this library can be moved to monorepo `libs/`
 * for reuse across multiple Payload CMS projects.
 */

export { metaField, seoTab } from './fields';
export type { SEOConfig, SEODocument,SEOFields } from './types';

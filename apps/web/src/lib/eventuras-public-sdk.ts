/**
 * Eventuras Public SDK - For ISR/SSG Pages
 *
 * This module provides the public (anonymous) client and SDK functions for use in:
 * - Static site generation (SSG)
 * - Incremental static regeneration (ISR)
 * - Public pages that don't require authentication
 * - generateStaticParams functions
 *
 * ## Why this exists
 *
 * The public client doesn't inject authentication tokens, making it safe for:
 * - Build-time data fetching where cookies aren't available
 * - Public endpoints that should work for anonymous users
 * - ISR pages that need to fetch data without user context
 *
 * ## Usage Pattern
 *
 * ```typescript
 * import { publicClient, getV3Events } from '@/lib/eventuras-public-sdk';
 *
 * export const revalidate = 300; // ISR every 5 minutes
 *
 * export default async function PublicPage() {
 *   const events = await getV3Events({
 *     client: publicClient, // Always pass the public client
 *     query: { ... }
 *   });
 * }
 * ```
 *
 * ## Don't use in authenticated pages
 *
 * ❌ For authenticated pages, use:
 *    import { getV3Events } from '@/lib/eventuras-sdk';
 */

import { getPublicClient } from './eventuras-public-client';

// Export the public client instance
export const publicClient = getPublicClient();

// Re-export all SDK functions and types
export * from '@eventuras/event-sdk';

/**
 * Eventuras Public API Client
 *
 * A client for public (anonymous) API endpoints that don't require authentication.
 * Use this client during static generation (generateStaticParams) or for public data.
 *
 * This client does not attempt to inject auth tokens, making it safe to use in
 * contexts where cookies/session are not available (e.g., build time).
 */

import { createClient } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'web:api-client',
  context: { module: 'eventuras-public-client' },
});

/**
 * Create and configure a public (non-authenticated) API client.
 * This client is suitable for:
 * - Static generation (generateStaticParams)
 * - Public event listings
 * - Any endpoint marked [AllowAnonymous] in the API
 *
 * @throws {Error} If NEXT_PUBLIC_BACKEND_URL is not set
 */
export function createPublicClient() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL environment variable is required. Please set it in your .env.local file.'
    );
  }

  logger.debug({ baseUrl }, 'Creating public API client');

  return createClient({ baseUrl });
}

/**
 * Singleton instance of the public client for reuse.
 * Initialized lazily on first access.
 */
let publicClientInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get or create the singleton public client instance.
 */
export function getPublicClient() {
  if (!publicClientInstance) {
    publicClientInstance = createPublicClient();
  }
  return publicClientInstance;
}

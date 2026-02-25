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

let publicClientInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get the public client instance.
 * Lazily creates and configures the client on first call.
 * @returns The configured public client for anonymous API access
 */
export function getPublicClient() {
  if (publicClientInstance) {
    return publicClientInstance;
  }

  // Read directly from process.env for Next.js build-time inlining
  // This ensures the value is available during static generation
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    // During build time, create a dummy client
    // At runtime, this would be a problem but build should skip these pages
    logger.warn('BACKEND_URL not set - creating placeholder client');
    // Return a dummy client that will fail gracefully if actually used
    publicClientInstance = createClient({ baseUrl: 'http://localhost:5000' });
    return publicClientInstance;
  }

  logger.debug({ baseUrl }, 'Creating public API client');

  publicClientInstance = createClient({ baseUrl });

  return publicClientInstance;
}

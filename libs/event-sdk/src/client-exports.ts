/**
 * Manual exports for client-next
 * This file won't be overwritten by openapi-ts generation
 */

// Export everything from the generated client-next
export * from './client-next/index';

// Export the configured client instance for direct use
export { client } from './client-next/client.gen';

// Export client utilities
export { createClient, createConfig } from './client-next/client';
export type {
  Client,
  Config,
  ClientOptions,
  RequestOptions
} from './client-next/client/types.gen';

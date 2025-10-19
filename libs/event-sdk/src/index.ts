// Re-export generated SDK client-next
export * from './client-next/index';

// Export the client instance and utilities
export { client } from './client-next/client.gen';
export { createClient, createConfig } from './client-next/client';
export type {
  Client,
  Config,
  ClientOptions,
  RequestOptions
} from './client-next/client/types.gen';

import type { CreateClientConfig } from './client-next/client.gen';

/**
 * Default client configuration for event-sdk.
 * This provides a base configuration that can be overridden by consuming applications.
 *
 * For Next.js applications with authentication, you MUST:
 * 1. Call client.setConfig() with your baseUrl and auth logic, OR
 * 2. Use interceptors to inject auth headers dynamically
 *
 * @example
 * ```typescript
 * import { client } from '@eventuras/event-sdk/client-next';
 *
 * client.setConfig({
 *   baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
 * });
 *
 * client.interceptors.request.use(async (options) => {
 *   const token = await getAccessToken();
 *   if (token) {
 *     options.headers.set('Authorization', `Bearer ${token}`);
 *   }
 *   return options;
 * });
 * ```
 */
export const createClientConfig: CreateClientConfig = (config) => {
  if (!config?.baseUrl) {
    throw new Error(
      'event-sdk: baseUrl is required. Please configure the client with client.setConfig({ baseUrl: "..." }) before making any requests.'
    );
  }

  return {
    ...(config || {}),
    baseUrl: config.baseUrl,
  };
};

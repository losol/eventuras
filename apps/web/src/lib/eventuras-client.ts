/**
 * Eventuras API Client Configuration
 * 
 * This module configures the event-sdk client with authentication and base URL.
 * The configuration is applied using interceptors to ensure auth tokens are
 * injected on every request in server-side contexts.
 */

import { client, type RequestOptions } from '@eventuras/event-sdk/client-next';
import { getAccessToken } from '@/utils/getAccesstoken';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ 
  namespace: 'web:api-client',
  context: { module: 'eventuras-client' }
});

let isConfigured = false;

/**
 * Configure the Eventuras API client with base URL and authentication.
 * This should be called once at application startup (e.g., in root layout).
 * 
 * Uses interceptors to dynamically inject auth tokens on each request,
 * ensuring fresh tokens are used even if they're refreshed.
 */
export function configureEventurasClient() {
  if (isConfigured) {
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  
  logger.info({ baseUrl }, 'Configuring Eventuras API client');

  // Set base configuration
  client.setConfig({
    baseUrl,
  });

  // Add request interceptor for authentication
  // This runs on every request, ensuring fresh tokens
  client.interceptors.request.use(async (options: RequestOptions) => {
    try {
      // Only add auth on server-side
      if (typeof window === 'undefined') {
        logger.debug({ 
          url: options.url,
          method: options.method 
        }, 'API request initiated');

        try {
          const token = await getAccessToken();
          if (token) {
            // Initialize headers if not present
            if (!options.headers) {
              options.headers = new Headers();
            }
            
            // Convert headers to Headers object if needed
            if (options.headers instanceof Headers) {
              options.headers.set('Authorization', `Bearer ${token}`);
            } else if (Array.isArray(options.headers)) {
              options.headers.push(['Authorization', `Bearer ${token}`]);
            } else {
              (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
            
            logger.debug('Added auth token to request');
          } else {
            logger.debug('No auth token available for request');
          }
        } catch (error) {
          // Log error but don't fail the request
          // Some endpoints might not require auth
          logger.warn({ error }, 'Failed to get access token');
        }
      }
    } catch (error) {
      // Catch any unexpected errors in the interceptor itself
      logger.error({ error }, 'Unexpected error in request interceptor');
    }
    // Request interceptors must return void, they mutate options in place
  });

  // Add error interceptor to log connection failures
  client.interceptors.error.use(async (error: any, response: any, options: RequestOptions) => {
    // Check for connection refused errors
    if (error?.cause?.code === 'ECONNREFUSED' || error?.code === 'ECONNREFUSED') {
      logger.error({
        error,
        url: options.url,
        baseUrl,
        method: options.method,
        cause: error?.cause,
      }, 'Connection refused to API backend - is the backend running?');
    } else if (error) {
      logger.error({
        error,
        url: options.url,
        method: options.method,
        status: response?.status,
      }, 'API request failed');
    }
    
    return error;
  });

  isConfigured = true;
  logger.info('Eventuras API client configured successfully');
}

/**
 * Re-export the configured client for direct use if needed
 */
export { client };

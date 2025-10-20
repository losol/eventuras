/**
 * Eventuras API Client Configuration
 *
 * Configures the event-sdk client with authentication and base URL.
 *
 * HTTP request/response logging uses debug level.
 * Set LOG_LEVEL=debug to see all HTTP traffic.
 */

import { client, type RequestOptions } from '@eventuras/event-sdk';
import { getAccessToken } from '@/utils/getAccesstoken';
import { Logger, redactHeaders } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'web:api-client',
  context: { module: 'eventuras-client' }
});

let isConfigured = false;

/**
 * Configure the Eventuras API client.
 * Called once at application startup.
 * @throws {Error} If NEXT_PUBLIC_BACKEND_URL is not set
 */
export async function configureEventurasClient() {
  if (isConfigured) return;

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL environment variable is required. Please set it in your .env.local file.'
    );
  }

  client.setConfig({ baseUrl });

  // Inject auth token on every request (server-side only)
  client.interceptors.request.use(async (options: RequestOptions) => {
    if (typeof window === 'undefined') {
      try {
        const token = await getAccessToken();
        if (token) {
          if (!options.headers) options.headers = new Headers();

          if (options.headers instanceof Headers) {
            options.headers.set('Authorization', `Bearer ${token}`);
          } else if (Array.isArray(options.headers)) {
            options.headers.push(['Authorization', `Bearer ${token}`]);
          } else {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
          }
        }

        // Log request (debug level)
        const fullUrl = options.url?.startsWith('http') ? options.url : `${baseUrl}${options.url || ''}`;
        logger.debug({
          request: {
            url: fullUrl,
            method: options.method || 'GET',
            headers: options.headers ? redactHeaders(options.headers) : undefined,
          },
        }, 'HTTP request');
      } catch (error) {
        logger.warn({ error, url: options.url }, 'Failed to get access token');
      }
    }
  });

  // Log successful responses (debug level)
  client.interceptors.response.use(async (response: Response) => {
    logger.debug({
      response: {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
      },
    }, 'HTTP response');
    return response;
  });

  // Log errors with full context
  client.interceptors.error.use(async (error: unknown, response: unknown, options: RequestOptions) => {
    const fullUrl = options.url?.startsWith('http') ? options.url : `${baseUrl}${options.url || ''}`;
    const err = error as { cause?: { code?: string }; code?: string; message?: string };
    const resp = response as { status?: number; statusText?: string } | undefined;

    // Connection errors (ECONNREFUSED, ETIMEDOUT, etc.)
    if (err?.cause?.code === 'ECONNREFUSED' || err?.code === 'ECONNREFUSED') {
      logger.error({
        error: {
          message: err.message,
          code: err?.cause?.code || err?.code,
        },
        request: {
          url: fullUrl,
          method: options.method || 'GET',
          headers: options.headers ? redactHeaders(options.headers) : undefined,
        },
      }, 'Connection refused - Backend unreachable');
      return error;
    }

    // HTTP errors (4xx, 5xx)
    if (resp?.status && resp.status >= 400) {
      const logLevel = resp.status >= 500 ? 'error' : 'warn';
      logger[logLevel]({
        request: { url: fullUrl, method: options.method || 'GET' },
        response: { status: resp.status, statusText: resp.statusText },
      }, `HTTP ${resp.status} ${resp.statusText || ''}`);
      return error;
    }

    // Generic errors
    logger.error({
      error: {
        message: err?.message,
        code: err?.code,
      },
      request: { url: fullUrl, method: options.method || 'GET' },
    }, 'HTTP request failed');

    return error;
  });

  isConfigured = true;
}

export { client };

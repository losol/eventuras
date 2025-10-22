/**
 * Eventuras API Client Configuration
 *
 * Configures the event-sdk client with authentication and base URL.
 *
 * HTTP request/response logging uses debug level.
 * Set LOG_LEVEL=debug to see all HTTP traffic.
 */

import { client, type RequestOptions } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

import { getAccessToken } from '@/utils/getAccesstoken';

const logger = Logger.create({
  namespace: 'web:api-client',
  context: { module: 'eventuras-client' },
});

let isConfigured = false;
let configuredBaseUrl: string | null = null;

/**
 * Configure the Eventuras API client.
 * Can be called multiple times - will reconfigure if baseUrl changes or if not yet configured.
 * @throws {Error} If NEXT_PUBLIC_BACKEND_URL is not set
 */
export async function configureEventurasClient() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL environment variable is required. Please set it in your .env.local file.'
    );
  }

  // Only skip if already configured with the same baseUrl
  if (isConfigured && configuredBaseUrl === baseUrl) {
    return;
  }

  logger.info({ baseUrl }, 'Configuring Eventuras API client');
  client.setConfig({ baseUrl });
  configuredBaseUrl = baseUrl;

  // Inject auth token on every request (server-side only)
  client.interceptors.request.use(async (options: RequestOptions) => {
    if (typeof window === 'undefined') {
      try {
        const token = await getAccessToken();

        // Log request details
        const fullUrl = options.url?.startsWith('http')
          ? options.url
          : `${baseUrl}${options.url || ''}`;

        logger.info(
          {
            request: {
              url: fullUrl,
              method: options.method || 'GET',
              baseUrl,
            },
          },
          'API request interceptor - about to make request'
        );

        if (!token) {
          // Log warning but allow request to proceed for public endpoints
          logger.warn(
            {
              url: fullUrl,
              method: options.method || 'GET',
            },
            'No valid access token available for API request'
          );

          // Don't set Authorization header if no token
          // Public endpoints will work, authenticated ones will return 401
        } else {
          // Set the token
          if (!options.headers) options.headers = new Headers();

          if (options.headers instanceof Headers) {
            options.headers.set('Authorization', `Bearer ${token}`);
          } else if (Array.isArray(options.headers)) {
            options.headers.push(['Authorization', `Bearer ${token}`]);
          } else {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
          }

          logger.debug(
            {
              request: {
                url: fullUrl,
                method: options.method || 'GET',
                hasAuth: true,
              },
            },
            'HTTP request with authentication'
          );
        }
      } catch (error) {
        logger.error({ error, url: options.url }, 'Failed to get access token for API request');
        // Let request proceed without auth - API will return 401 if needed
      }
    }
  });

  // Log successful responses (debug level)
  client.interceptors.response.use(async (response: Response) => {
    logger.debug(
      {
        response: {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
        },
      },
      'HTTP response'
    );
    return response;
  });

  // Log errors with full context
  client.interceptors.error.use(
    async (error: unknown, response: unknown, options: RequestOptions) => {
      const fullUrl = options.url?.startsWith('http')
        ? options.url
        : `${baseUrl}${options.url || ''}`;
      const err = error as { cause?: { code?: string }; code?: string; message?: string };
      const resp = response as { status?: number; statusText?: string } | undefined;

      // Authentication/Authorization errors (401/403)
      if (resp?.status === 401 || resp?.status === 403) {
        logger.warn(
          {
            request: { url: fullUrl, method: options.method || 'GET' },
            response: { status: resp.status, statusText: resp.statusText },
          },
          `Authentication failed (${resp.status}) - Token may be invalid or expired`
        );
        return error;
      }

      // Connection errors (ECONNREFUSED, ETIMEDOUT, etc.)
      if (err?.cause?.code === 'ECONNREFUSED' || err?.code === 'ECONNREFUSED') {
        logger.error(
          {
            error: {
              message: err.message,
              code: err?.cause?.code || err?.code,
            },
            request: {
              url: fullUrl,
              method: options.method || 'GET',
              baseUrl,
            },
            configuredBaseUrl: baseUrl,
          },
          'Connection refused - Backend unreachable. Check if backend is running on the configured baseUrl.'
        );
        return error;
      }

      // Other HTTP errors (4xx, 5xx)
      if (resp?.status && resp.status >= 400) {
        const logLevel = resp.status >= 500 ? 'error' : 'warn';
        logger[logLevel](
          {
            request: { url: fullUrl, method: options.method || 'GET' },
            response: { status: resp.status, statusText: resp.statusText },
          },
          `HTTP ${resp.status} ${resp.statusText || ''}`
        );
        return error;
      }

      // Generic errors
      logger.error(
        {
          error: {
            message: err?.message,
            code: err?.code,
          },
          request: { url: fullUrl, method: options.method || 'GET' },
        },
        'HTTP request failed'
      );

      return error;
    }
  );

  isConfigured = true;
}

export { client };

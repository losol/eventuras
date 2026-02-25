/**
 * Eventuras API Client Configuration
 *
 * Configures the event-sdk client with authentication and base URL.
 * The client is automatically configured when this module is imported on the server.
 *
 * ⚠️ WARNING: This client is SERVER-SIDE ONLY!
 * Do not import this in client components. Use server actions instead.
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

// Guard: Throw error if imported on client side
if (typeof window !== 'undefined') {
  throw new Error(
    '❌ eventuras-client is SERVER-SIDE ONLY!\n\n' +
      'You are trying to import @/lib/eventuras-client in a client component.\n' +
      'This will not work because:\n' +
      '  1. Server-side configuration (appConfig) is not available in the browser\n' +
      '  2. Authentication tokens should not be exposed to the client\n\n' +
      'Solutions:\n' +
      '  - Use server actions for data mutations\n' +
      '  - Use server components for data fetching\n' +
      '  - If you need the client in a client component, you are doing something wrong!'
  );
}

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;

  // Synchronous import - config.server is a regular module
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { appConfig } = require('@/config.server');

  const baseUrl = appConfig.env.BACKEND_URL as string;

  if (!baseUrl) {
    // During build time, this is acceptable - pages won't actually be pre-rendered
    // At runtime, this is a fatal error
    logger.warn('BACKEND_URL not set - skipping client configuration');
    return; // Don't configure, don't throw
  }

  logger.info({ baseUrl }, 'Configuring Eventuras API client');

  // Configure base URL
  client.setConfig({ baseUrl });

  // Inject auth token on every request (server-side only)
  client.interceptors.request.use(async (options: RequestOptions) => {
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

// Note: Configuration is done lazily when client is first used
// This allows builds to succeed even without env vars set
// (admin pages are server-rendered, not statically generated)

export { client, ensureConfigured };

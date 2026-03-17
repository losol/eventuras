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

import {
  CORRELATION_ID_HEADER,
  createCorrelationId,
  readCorrelationIdFromResponse,
} from '@/lib/correlation-id';
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

  // Inject correlation ID and auth token on every request (server-side only)
  client.interceptors.request.use(async (options: RequestOptions) => {
    // Always set correlation ID — even if auth fails
    const correlationId = createCorrelationId();
    if (!options.headers) options.headers = new Headers();
    if (options.headers instanceof Headers) {
      options.headers.set(CORRELATION_ID_HEADER, correlationId);
    } else if (Array.isArray(options.headers)) {
      options.headers.push([CORRELATION_ID_HEADER, correlationId]);
    } else {
      (options.headers as Record<string, string>)[CORRELATION_ID_HEADER] = correlationId;
    }

    try {
      const token = await getAccessToken();

      const fullUrl = options.url?.startsWith('http')
        ? options.url
        : `${baseUrl}${options.url || ''}`;

      if (!token) {
        logger.warn(
          { url: fullUrl, method: options.method || 'GET' },
          'No valid access token available for API request'
        );
      } else {
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${token}`);
        } else if (Array.isArray(options.headers)) {
          options.headers.push(['Authorization', `Bearer ${token}`]);
        } else {
          (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        logger.debug(
          { request: { url: fullUrl, method: options.method || 'GET', hasAuth: true } },
          'HTTP request with authentication'
        );
      }
    } catch (error) {
      logger.error({ error, url: options.url }, 'Failed to get access token for API request');
    }
  });

  // Log successful responses (debug level)
  client.interceptors.response.use(async (response: Response) => {
    const correlationId = readCorrelationIdFromResponse(response);
    logger.debug(
      {
        response: {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          correlationId,
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
      const request = { url: fullUrl, method: options.method || 'GET' };
      const correlationId =
        response instanceof Response ? readCorrelationIdFromResponse(response) : undefined;

      // Connection errors (ECONNREFUSED, ETIMEDOUT, etc.)
      if (err?.cause?.code === 'ECONNREFUSED' || err?.code === 'ECONNREFUSED') {
        logger.error(
          { error: { message: err.message, code: err?.cause?.code || err?.code }, request },
          'Connection refused - Backend unreachable'
        );
        return error;
      }

      // HTTP errors — log the parsed error body from backend
      if (resp?.status && resp.status >= 400) {
        const logLevel = resp.status >= 500 ? 'error' : 'warn';
        logger[logLevel](
          {
            request,
            response: { status: resp.status, statusText: resp.statusText, correlationId },
            error,
          },
          `HTTP ${resp.status} ${resp.statusText || ''}`
        );
        return error;
      }

      // Generic errors
      logger.error(
        { request, error: { message: err?.message, code: err?.code } },
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

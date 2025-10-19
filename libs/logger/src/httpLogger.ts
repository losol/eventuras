/**
 * HTTP logging utilities for API clients.
 * Provides header redaction for structured logging.
 */

const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'proxy-authorization',
];

/**
 * Redact sensitive headers for logging.
 * Use with logger.debug/info/error to safely log HTTP headers.
 *
 * @example
 * logger.debug({
 *   request: {
 *     url: '/api/users',
 *     headers: redactHeaders(headers)
 *   }
 * }, 'HTTP request');
 */
export function redactHeaders(
  headers: Headers | Record<string, unknown> | [string, string][],
): Record<string, string> {
  const result: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value: string, key: string) => {
      result[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) ? '[REDACTED]' : value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) ? '[REDACTED]' : String(value);
    });
  } else {
    Object.entries(headers).forEach(([key, value]) => {
      result[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) ? '[REDACTED]' : String(value);
    });
  }

  return result;
}

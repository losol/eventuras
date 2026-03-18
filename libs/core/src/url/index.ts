/**
 * Join a base URL with path segments, handling slashes correctly.
 *
 * @example
 * joinUrl('https://example.com/', '/api', '/v1') // 'https://example.com/api/v1'
 * joinUrl('https://example.com', 'api', 'v1')    // 'https://example.com/api/v1'
 */
export function joinUrl(base: string, ...segments: string[]): string {
  return segments.reduce(
    (url, segment) => url.replace(/\/+$/, '') + '/' + segment.replace(/^\/+/, ''),
    base
  );
}

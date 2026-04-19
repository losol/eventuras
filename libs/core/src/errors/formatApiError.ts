/**
 * Extract a human-readable message from an SDK error payload.
 *
 * Handles:
 *  - Plain string bodies (the SDK's fallback when a response isn't JSON)
 *  - ASP.NET Problem Details (RFC 7807) with `errors: { Field: [msgs] }`
 *    — surfaced per-field so validation feedback makes it to the caller
 *  - Problem Details with `detail` or `title`
 *  - Legacy shapes with `body.message`, `message`, or `statusText`
 *
 * When nothing readable can be extracted, falls back to a status-aware
 * synthetic message for 5xx responses — servers often return an empty body
 * on unhandled exceptions, and "Failed to update X" hides that it's a
 * server problem, not the caller's. Falls back to the caller-supplied
 * `fallback` otherwise.
 */
export function formatApiError(
  raw: unknown,
  fallback: string,
  statusCode?: number,
  correlationId?: string | null
): string {
  const reference = correlationId ? `Reference ${correlationId}. ` : '';
  const serverFallback =
    statusCode != null && statusCode >= 500
      ? `Server error (${statusCode}). ${reference}Please try again or contact support if the problem persists.`
      : null;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed || serverFallback || fallback;
  }

  if (!raw || typeof raw !== 'object') {
    return serverFallback || fallback;
  }

  const err = raw as {
    errors?: Record<string, string[] | string | undefined>;
    title?: string;
    detail?: string;
    body?: { message?: string };
    message?: string;
    statusText?: string;
  };

  if (err.errors && typeof err.errors === 'object') {
    const parts = Object.entries(err.errors)
      .map(([field, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(', ') : msgs;
        return text ? `${field}: ${text}` : field;
      })
      .filter(Boolean);
    if (parts.length > 0) {
      const prefix = err.title ? `${err.title} — ` : '';
      return `${prefix}${parts.join('; ')}`;
    }
  }

  return (
    err.detail ||
    err.title ||
    err.body?.message ||
    err.message ||
    err.statusText ||
    serverFallback ||
    fallback
  );
}

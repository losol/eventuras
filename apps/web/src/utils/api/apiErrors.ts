type SdkResult = { error?: unknown; response?: { status: number } };

/**
 * The SDK returns errors instead of throwing. Throws on any error, so a failed
 * request (e.g. 429) isn't shown as "not found" or empty. A 404 is let through
 * for single-resource lookups; set `allowNotFound: false` for lists.
 */
export function throwIfApiError(
  result: SdkResult,
  what: string,
  { allowNotFound = true }: { allowNotFound?: boolean } = {}
): void {
  if (result.error && !(allowNotFound && result.response?.status === 404)) {
    throw new Error(`Failed to load ${what} (HTTP ${result.response?.status ?? 'no response'})`);
  }
}

/** True when the API rejected the request because it is busy (HTTP 429). */
export const isApiBusy = (result: SdkResult): boolean => result.response?.status === 429;

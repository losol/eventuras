type SdkResult = { error?: unknown; response?: { status: number } };

/**
 * The SDK returns errors instead of throwing. Throws on any error except 404,
 * so a failed request (e.g. 429) isn't shown as "not found" or empty.
 */
export function throwIfApiError(result: SdkResult, what: string): void {
  if (result.error && result.response?.status !== 404) {
    throw new Error(`Failed to load ${what} (HTTP ${result.response?.status ?? 'no response'})`);
  }
}

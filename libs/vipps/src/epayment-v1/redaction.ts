/**
 * Handling of Vipps PII redaction.
 *
 * Vipps removes personal data from payment details after a retention period
 * replacing each affected field value with the literal
 * string "[Expired]" — e.g. userDetails and shippingDetails.address on
 * Express Checkout payments. Re-fetching an old payment therefore returns a
 * response where PII fields hold "[Expired]" instead of the original values.
 * https://developer.vippsmobilepay.com/docs/knowledge-base/user-flow/#personal-information-expiry
 */

import type { PaymentDetails } from './types';

const EXPIRED = '[Expired]';

/** True when a field value is the Vipps redaction placeholder. */
export function isExpiredValue(value: unknown): boolean {
  return value === EXPIRED;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeValue(fresh: unknown, previous: unknown): unknown {
  if (isExpiredValue(fresh)) {
    // Keep the previously stored value when it is usable; if it is missing
    // (or itself redacted) the placeholder is the most honest value we have.
    return previous !== undefined && previous !== null && !isExpiredValue(previous)
      ? previous
      : fresh;
  }

  if (Array.isArray(fresh)) {
    const prevArray = Array.isArray(previous) ? previous : [];
    return fresh.map((item, index) => mergeValue(item, prevArray[index]));
  }

  if (isPlainObject(fresh)) {
    const prevObject = isPlainObject(previous) ? previous : {};
    const merged: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fresh)) {
      merged[key] = mergeValue(value, prevObject[key]);
    }
    return merged;
  }

  return fresh;
}

/**
 * Merge freshly fetched payment details with a previously stored copy so that
 * fields Vipps has redacted to "[Expired]" keep their stored values instead of
 * overwriting them. Everything Vipps still reports (state, aggregate amounts,
 * …) comes from the fresh response.
 *
 * `previous` is typically a persisted JSON blob of unknown shape; anything that
 * does not line up with the fresh structure is ignored.
 */
export function mergeExpiredPaymentDetails(
  fresh: PaymentDetails,
  previous: unknown
): PaymentDetails {
  return mergeValue(fresh, previous) as PaymentDetails;
}

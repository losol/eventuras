import { describe, expect, it } from 'vitest';

import { isApiBusy, throwIfApiError } from './apiErrors';

describe('throwIfApiError', () => {
  it('passes on success', () => {
    expect(() => throwIfApiError({ response: { status: 200 } }, 'event')).not.toThrow();
  });

  it('passes on 404 so callers can show "not found"', () => {
    expect(() => throwIfApiError({ error: {}, response: { status: 404 } }, 'event')).not.toThrow();
  });

  it.each([429, 500, 503])('throws on %i', status => {
    expect(() => throwIfApiError({ error: {}, response: { status } }, 'event')).toThrow(
      `Failed to load event (HTTP ${status})`
    );
  });

  it('throws on 404 for lists', () => {
    expect(() =>
      throwIfApiError({ error: {}, response: { status: 404 } }, 'events', { allowNotFound: false })
    ).toThrow('Failed to load events (HTTP 404)');
  });

  it('throws when there is no response', () => {
    expect(() => throwIfApiError({ error: new Error('network') }, 'event')).toThrow('no response');
  });
});

describe('isApiBusy', () => {
  it('is true only for 429', () => {
    expect(isApiBusy({ error: {}, response: { status: 429 } })).toBe(true);
    expect(isApiBusy({ error: {}, response: { status: 500 } })).toBe(false);
    expect(isApiBusy({ response: { status: 200 } })).toBe(false);
  });
});

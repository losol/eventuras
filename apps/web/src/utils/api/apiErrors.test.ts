import { describe, expect, it } from 'vitest';

import { throwIfApiError } from './apiErrors';

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

  it('throws when there is no response', () => {
    expect(() => throwIfApiError({ error: new Error('network') }, 'event')).toThrow('no response');
  });
});

/**
 * Tests for the useHeartbeat React hook.
 *
 * The hook schedules refreshes from the access token's expiry (returned by the
 * endpoint as `accessTokenExpiresAt`), primes once on mount to learn it, and
 * defers when the tab is hidden/idle. Tests run under fake timers so we can
 * advance time deterministically, with a mocked global fetch.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';

import { useHeartbeat } from './use-heartbeat';

/** Minimal component that mounts the hook with given config. */
function HeartbeatHost(props: Parameters<typeof useHeartbeat>[0] = {}) {
  useHeartbeat(props);
  return null;
}

/** Dispatches a keystroke on window so the activity tracker records it. */
function recordKeystroke(): void {
  window.dispatchEvent(new Event('keydown'));
}

/** Sets visibilityState and fires the visibilitychange event. */
function setVisibility(state: 'visible' | 'hidden'): void {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

/** A 200 response carrying an access-token expiry `ttlMs` from now (ISO). */
function expiryResponse(ttlMs: number): Response {
  return new Response(
    JSON.stringify({ accessTokenExpiresAt: new Date(Date.now() + ttlMs).toISOString() }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

/** Flush pending timers up to `ms`, draining microtasks in between. */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility('visible');
  // Default: every refresh succeeds with a 5-minute token.
  fetchMock = vi.fn().mockImplementation(() => Promise.resolve(expiryResponse(5 * 60_000)));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useHeartbeat — priming', () => {
  it('refreshes immediately on mount to discover the expiry', async () => {
    const onRefreshed = vi.fn();
    render(<HeartbeatHost onRefreshed={onRefreshed} />);

    await advance(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/heartbeat',
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    );
    expect(onRefreshed).toHaveBeenCalledTimes(1);
  });

  it('honors a custom endpoint', async () => {
    render(<HeartbeatHost endpoint="/custom/heartbeat" />);
    await advance(0);
    expect(fetchMock).toHaveBeenCalledWith('/custom/heartbeat', expect.anything());
  });

  it('skips the prime and schedules from initialExpiresAt when provided', async () => {
    const tenMin = new Date(Date.now() + 10 * 60_000).toISOString();
    render(<HeartbeatHost initialExpiresAt={tenMin} fraction={0.3} />);

    // No immediate refresh — expiry is already known.
    await advance(0);
    expect(fetchMock).not.toHaveBeenCalled();

    // lead = 0.3 * 10min = 3min → refresh after 7min.
    await advance(7 * 60_000 - 1000);
    expect(fetchMock).not.toHaveBeenCalled();
    await advance(1000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('useHeartbeat — expiry-driven cadence', () => {
  it('schedules the next refresh from the returned expiry (5-min token, fraction 0.3)', async () => {
    render(<HeartbeatHost fraction={0.3} />);

    // Prime.
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // lead = 0.3 * 5min = 90s → next refresh after 210s.
    await advance(210_000 - 1000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(1000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('self-adjusts to a short TTL via the skew floor (10-second token)', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(expiryResponse(10_000)));
    render(<HeartbeatHost fraction={0.3} minSkewMs={5_000} minRefreshIntervalMs={5_000} />);

    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // lead = max(5s, 0.3*10s=3s) = 5s → refresh 5s in.
    await advance(4_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never refreshes faster than minRefreshIntervalMs for ultra-short tokens', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(expiryResponse(1_000)));
    render(<HeartbeatHost minSkewMs={5_000} minRefreshIntervalMs={5_000} />);

    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(4_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('useHeartbeat — session expired', () => {
  it('fires onSessionExpired on 401 and stops further refreshes', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    const onSessionExpired = vi.fn();
    const onRefreshed = vi.fn();

    render(<HeartbeatHost onSessionExpired={onSessionExpired} onRefreshed={onRefreshed} />);

    await advance(0);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(onRefreshed).not.toHaveBeenCalled();

    // No further refreshes after teardown.
    await advance(10 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('useHeartbeat — transient failure', () => {
  it('retries with backoff and reports via onError, then resumes', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockImplementation(() => Promise.resolve(expiryResponse(5 * 60_000)));
    const onError = vi.fn();

    render(<HeartbeatHost minRefreshIntervalMs={5_000} onError={onError} />);

    // Prime fails.
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);

    // Backoff = minRefreshIntervalMs (first retry) → retry succeeds.
    await advance(5_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('useHeartbeat — defer when hidden/idle', () => {
  it('defers a due refresh while idle, then refreshes on the next interaction', async () => {
    render(<HeartbeatHost fraction={0.3} idleThresholdMs={1_000} />);

    // Prime at mount (active), token = 5min → next refresh at 210s.
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // By 210s the user has been idle far longer than 1s → refresh is deferred.
    await advance(210_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Interaction wakes the deferred refresh.
    recordKeystroke();
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('defers while the tab is hidden, then refreshes when it becomes visible', async () => {
    // idleThresholdMs is shorter than the time spent hidden, so returning to the
    // tab must count as activity for the deferred refresh to run on focus alone.
    render(<HeartbeatHost fraction={0.3} idleThresholdMs={1_000} />);

    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    setVisibility('hidden');
    await advance(210_000);
    expect(fetchMock).toHaveBeenCalledTimes(1); // deferred while hidden

    setVisibility('visible');
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('useHeartbeat — unmount', () => {
  it('does not fire callbacks for fetches that resolve after unmount', async () => {
    let resolveFetch: (response: Response) => void = () => undefined;
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise<Response>((resolve, reject) => {
        resolveFetch = resolve;
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const onRefreshed = vi.fn();
    const onError = vi.fn();
    const { unmount } = render(<HeartbeatHost onRefreshed={onRefreshed} onError={onError} />);

    // Prime fires; fetch is in-flight (pending promise).
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Unmount aborts the controller; resolve the pending fetch and drain.
    unmount();
    resolveFetch(new Response('{}', { status: 200 }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onRefreshed).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});

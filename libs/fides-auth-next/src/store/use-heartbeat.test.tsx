/**
 * Tests for the useHeartbeat React hook.
 *
 * The hook combines an activity tracker, a setTimeout-driven schedule, fetch,
 * and a visibilitychange listener. Tests run under fake timers so we can
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

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility('visible');

  // Default: every fetch succeeds with 200 + empty JSON body.
  fetchMock = vi.fn().mockResolvedValue(
    new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// Params chosen so the activity gate is meaningful:
//
// - intervalMs > tracker throttle (1000) so keystrokes between ticks register
// - idleThresholdMs < intervalMs so the tracker's initial mount-time timestamp
//   has already fallen outside the idle window by the time the first tick
//   fires. With these numbers, a tick can only fire if a keystroke was
//   recorded in the last 500ms — proving the gate is exercised.
const HAPPY_INTERVAL = 3000;
const HAPPY_IDLE = 500;

describe('useHeartbeat — happy path', () => {
  it('POSTs to the default endpoint on each tick when active and visible', async () => {
    const onRefreshed = vi.fn();
    const { unmount } = render(
      <HeartbeatHost intervalMs={HAPPY_INTERVAL} idleThresholdMs={HAPPY_IDLE} onRefreshed={onRefreshed} />,
    );

    // Advance to just before the first tick, record a keystroke INSIDE the
    // idle window, then let the tick fire. The initial mount timestamp is now
    // 2900ms old, well outside the 500ms idle window, so only the fresh
    // keystroke can keep the tick alive.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HAPPY_INTERVAL - 100);
    });
    recordKeystroke();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/heartbeat', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
    }));
    expect(onRefreshed).toHaveBeenCalledTimes(1);

    // Second tick: same pattern — fresh keystroke close to the next tick.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HAPPY_INTERVAL - 100);
    });
    recordKeystroke();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('honors a custom endpoint', async () => {
    render(<HeartbeatHost endpoint="/custom/heartbeat" intervalMs={HAPPY_INTERVAL} idleThresholdMs={HAPPY_IDLE} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HAPPY_INTERVAL - 100);
    });
    recordKeystroke();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(fetchMock).toHaveBeenCalledWith('/custom/heartbeat', expect.anything());
  });

  it('skips the tick when no fresh keystroke arrived before the activity window closed', async () => {
    // Companion to the happy-path: with the SAME interval/threshold but no
    // keystroke, the tick should be skipped — proving the gate works in both
    // directions. (The "no recent activity" describe block below uses a
    // broader scenario; this one shares params with the happy-path tests to
    // pin down the gate.)
    render(<HeartbeatHost intervalMs={HAPPY_INTERVAL} idleThresholdMs={HAPPY_IDLE} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HAPPY_INTERVAL);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('useHeartbeat — gating', () => {
  it('skips the tick when the tab is hidden', async () => {
    render(<HeartbeatHost intervalMs={1000} idleThresholdMs={5000} />);
    recordKeystroke();
    setVisibility('hidden');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips the tick when there has been no recent activity', async () => {
    // No keystroke is dispatched, so the tracker's initial timestamp is the
    // only activity — and we advance time past the idle threshold before tick.
    render(<HeartbeatHost intervalMs={5000} idleThresholdMs={1000} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('useHeartbeat — session expired', () => {
  it('fires onSessionExpired when the endpoint returns 401 and stops further ticks', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    const onSessionExpired = vi.fn();
    const onRefreshed = vi.fn();

    render(<HeartbeatHost
      intervalMs={1000}
      idleThresholdMs={5000}
      onSessionExpired={onSessionExpired}
      onRefreshed={onRefreshed}
    />);
    recordKeystroke();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(onRefreshed).not.toHaveBeenCalled();

    // After teardown on 401, subsequent intervals should NOT fire fetch.
    recordKeystroke();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});

describe('useHeartbeat — visibilitychange refocus', () => {
  it('beats immediately when tab regains focus after >= intervalMs away', async () => {
    render(<HeartbeatHost intervalMs={1000} idleThresholdMs={10_000} />);
    recordKeystroke();

    // Hide the tab so the scheduled tick at t=1000 is skipped.
    setVisibility('hidden');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(fetchMock).not.toHaveBeenCalled();

    // Now reveal — sinceLast (2s) >= intervalMs (1s), so beat should fire immediately.
    recordKeystroke();
    setVisibility('visible');

    await act(async () => {
      // Let the microtask queue drain.
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does NOT immediately beat when refocus happens within intervalMs', async () => {
    render(<HeartbeatHost intervalMs={10_000} idleThresholdMs={60_000} />);
    recordKeystroke();

    setVisibility('hidden');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    setVisibility('visible');

    await act(async () => {
      await Promise.resolve();
    });

    // sinceLast (1s) < intervalMs (10s), so no immediate beat.
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('useHeartbeat — unmount', () => {
  it('does not fire callbacks for fetches that resolve after unmount', async () => {
    let resolveFetch: (response: Response) => void = () => undefined;
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      // Mirror the AbortController behavior: reject if signal aborts.
      return new Promise<Response>((resolve, reject) => {
        resolveFetch = resolve;
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const onRefreshed = vi.fn();
    const onError = vi.fn();
    const { unmount } = render(<HeartbeatHost
      intervalMs={1000}
      idleThresholdMs={5000}
      onRefreshed={onRefreshed}
      onError={onError}
    />);
    recordKeystroke();

    // Tick fires; fetch is in-flight (pending promise).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Unmount aborts the controller; resolve the pending fetch and let microtasks drain.
    unmount();
    resolveFetch(new Response('{}', { status: 200 }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Neither callback should have fired — the post-await `stopped` guard
    // bails before they're called.
    expect(onRefreshed).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});

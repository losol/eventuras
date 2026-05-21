/**
 * Tests for createActivityTracker — production usage patterns:
 *
 * - Recording activity from DOM events
 * - Throttling rapid-fire events
 * - Querying recent activity windows for heartbeat decisions
 * - Cleanup on dispose
 */
import { createActivityTracker, DEFAULT_ACTIVITY_EVENTS } from './activity-tracker';

/**
 * Drives an injectable clock so tests don't depend on real time.
 * The tracker accepts a `now` function — we control it here.
 */
function makeClock(start = 1_000_000) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe('createActivityTracker — recording activity', () => {
  it('starts with the initial timestamp (defaults to now())', () => {
    const clock = makeClock();
    const tracker = createActivityTracker({ target: new EventTarget(), now: clock.now });

    expect(tracker.getLastActivity()).toBe(1_000_000);
  });

  it('records activity when a tracked event fires', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({ target, now: clock.now });

    clock.advance(5_000);
    target.dispatchEvent(new Event('keydown'));

    expect(tracker.getLastActivity()).toBe(1_005_000);

    tracker.dispose();
  });

  it('ignores events that are not in the configured list', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({
      target,
      events: ['keydown'],
      now: clock.now,
    });

    clock.advance(5_000);
    target.dispatchEvent(new Event('mousemove')); // not in events list

    // Last activity unchanged from initial.
    expect(tracker.getLastActivity()).toBe(1_000_000);

    tracker.dispose();
  });
});

describe('createActivityTracker — throttling', () => {
  it('throttles rapid-fire events within throttleMs', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({
      target,
      throttleMs: 1000,
      now: clock.now,
    });

    // First event lands.
    clock.advance(2000);
    target.dispatchEvent(new Event('keydown'));
    expect(tracker.getLastActivity()).toBe(1_002_000);

    // Second event 500 ms later — within throttle, should NOT update.
    clock.advance(500);
    target.dispatchEvent(new Event('keydown'));
    expect(tracker.getLastActivity()).toBe(1_002_000);

    // Third event 600 ms after that (1100 ms since last recorded) — should update.
    clock.advance(600);
    target.dispatchEvent(new Event('keydown'));
    expect(tracker.getLastActivity()).toBe(1_003_100);

    tracker.dispose();
  });

  it('recordActivity() bypasses the throttle', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({
      target,
      throttleMs: 60_000, // very aggressive throttle
      now: clock.now,
    });

    clock.advance(100);
    tracker.recordActivity();
    expect(tracker.getLastActivity()).toBe(1_000_100);

    clock.advance(50);
    tracker.recordActivity();
    expect(tracker.getLastActivity()).toBe(1_000_150);

    tracker.dispose();
  });
});

describe('createActivityTracker — isActiveWithin', () => {
  it('returns true when activity is inside the window', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({ target, now: clock.now });

    target.dispatchEvent(new Event('keydown'));
    clock.advance(30_000); // 30s since activity

    expect(tracker.isActiveWithin(60_000)).toBe(true); // 60s window

    tracker.dispose();
  });

  it('returns false when activity is outside the window', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({ target, now: clock.now });

    target.dispatchEvent(new Event('keydown'));
    clock.advance(120_000); // 2 min since activity

    expect(tracker.isActiveWithin(60_000)).toBe(false); // 1 min window

    tracker.dispose();
  });
});

describe('createActivityTracker — disposal', () => {
  it('stops recording activity after dispose()', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({ target, now: clock.now });

    tracker.dispose();

    clock.advance(5000);
    target.dispatchEvent(new Event('keydown'));

    // dispose removed the listener, so last activity is still the initial value.
    expect(tracker.getLastActivity()).toBe(1_000_000);
  });

  it('dispose() is idempotent', () => {
    const tracker = createActivityTracker({ target: new EventTarget() });

    expect(() => {
      tracker.dispose();
      tracker.dispose();
    }).not.toThrow();
  });
});

describe('createActivityTracker — SSR safety', () => {
  it('does not throw when no target is given and window is undefined', () => {
    // In Node test env, `window` is undefined, so the default path takes the no-target branch.
    expect(() => {
      const tracker = createActivityTracker({ now: () => 42 });
      expect(tracker.getLastActivity()).toBe(42);
      tracker.dispose();
    }).not.toThrow();
  });

  it('recordActivity() still updates the timestamp without a target', () => {
    // Per the docstring contract: no listeners, but explicit recordActivity still works.
    const clock = makeClock();
    const tracker = createActivityTracker({ now: clock.now });

    clock.advance(500);
    tracker.recordActivity();

    expect(tracker.getLastActivity()).toBe(1_000_500);

    tracker.dispose();
  });
});

describe('createActivityTracker — default events', () => {
  it('uses focusin (which bubbles) rather than focus (which does not)', () => {
    // Regression guard: focus events do not bubble, so listening on window
    // would miss focus on nested elements. focusin is the bubbling variant.
    expect(DEFAULT_ACTIVITY_EVENTS).toContain('focusin');
    expect(DEFAULT_ACTIVITY_EVENTS).not.toContain('focus');
  });

  it('records activity when focusin fires (the bubbling variant)', () => {
    const clock = makeClock();
    const target = new EventTarget();
    const tracker = createActivityTracker({ target, now: clock.now });

    clock.advance(5_000);
    target.dispatchEvent(new Event('focusin'));

    expect(tracker.getLastActivity()).toBe(1_005_000);

    tracker.dispose();
  });
});

/**
 * Records the most recent user activity timestamp by listening to DOM events.
 *
 * Designed for "heartbeat" or "keepalive" logic that should only run while the
 * user is actually interacting with the page. The tracker itself does not poll
 * or call any network — it only records timestamps. Consumers (e.g. a React
 * hook) decide what to do with them.
 *
 * **Why DOM-level and not React?** Activity should be tracked at the window
 * level so a keystroke in a deeply nested editor counts, without every
 * component having to wire itself up.
 *
 * @example
 * ```ts
 * const tracker = createActivityTracker();
 *
 * // Later, e.g. in a heartbeat tick:
 * if (tracker.isActiveWithin(2 * 60_000)) {
 *   // user has been active in the last 2 minutes
 * }
 *
 * // On unmount:
 * tracker.dispose();
 * ```
 */

/**
 * Default DOM events that count as user activity.
 *
 * Uses `focusin` rather than `focus` because `focus` does not bubble — focusing
 * a nested input would otherwise be missed when listening on `window`.
 */
export const DEFAULT_ACTIVITY_EVENTS = [
  'pointerdown',
  'keydown',
  'touchstart',
  'focusin',
] as const;

export interface ActivityTrackerOptions {
  /**
   * Target to attach listeners to. Defaults to `globalThis.window` in the
   * browser. Tests can pass a Node `EventTarget` to drive activity manually.
   */
  target?: EventTarget;
  /** Event names that count as activity. Defaults to {@link DEFAULT_ACTIVITY_EVENTS}. */
  events?: readonly string[];
  /** Minimum ms between recorded timestamps. Defaults to 1000. */
  throttleMs?: number;
  /** Initial activity timestamp. Defaults to `now()`. */
  initialTimestamp?: number;
  /** Time source, for testing. Defaults to `Date.now`. */
  now?: () => number;
}

export interface ActivityTracker {
  /** Last recorded activity timestamp (ms since epoch). */
  getLastActivity(): number;
  /** True if activity was recorded within the last `ms` milliseconds. */
  isActiveWithin(ms: number): boolean;
  /** Force-record an activity timestamp (e.g. on successful server action). */
  recordActivity(): void;
  /** Remove listeners. Idempotent. */
  dispose(): void;
}

/**
 * Creates an activity tracker bound to a DOM-like event target.
 *
 * If no `target` is given and `globalThis.window` does not exist (e.g. SSR), no
 * listeners are attached. Explicit `recordActivity()` calls still update the
 * timestamp — only passive listening is skipped.
 */
export function createActivityTracker(options: ActivityTrackerOptions = {}): ActivityTracker {
  const now = options.now ?? (() => Date.now());
  const throttleMs = options.throttleMs ?? 1000;
  const events = options.events ?? DEFAULT_ACTIVITY_EVENTS;
  const target = options.target ?? (typeof window !== 'undefined' ? window : undefined);

  let lastActivity = options.initialTimestamp ?? now();
  let disposed = false;

  const recordActivity = (): void => {
    if (disposed) return;
    const t = now();
    if (t - lastActivity >= throttleMs) {
      lastActivity = t;
    }
  };

  // Attach listeners (no-op when no target — SSR safe).
  if (target) {
    for (const event of events) {
      target.addEventListener(event, recordActivity, { passive: true } as AddEventListenerOptions);
    }
  }

  return {
    getLastActivity: () => lastActivity,
    isActiveWithin: (ms: number) => now() - lastActivity <= ms,
    recordActivity: () => {
      // Bypass throttle when called explicitly.
      if (!disposed) lastActivity = now();
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      if (target) {
        for (const event of events) {
          target.removeEventListener(event, recordActivity);
        }
      }
    },
  };
}

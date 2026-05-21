'use client';

import { useEffect, useRef } from 'react';
import {
  createActivityTracker,
  type ActivityTracker,
} from '@eventuras/fides-auth/activity-tracker';
import { Logger } from '@eventuras/logger';

/**
 * Configuration for {@link useHeartbeat}.
 */
export interface HeartbeatConfig {
  /**
   * Endpoint to POST to in order to refresh the session.
   * The endpoint must run server-side refresh and return 2xx on success or 401
   * when the refresh token is no longer valid.
   * @default '/api/auth/heartbeat'
   */
  endpoint?: string;

  /**
   * Interval between heartbeat ticks, in ms.
   * @default 300_000 (5 minutes)
   */
  intervalMs?: number;

  /**
   * How recently the user must have interacted for a heartbeat to fire.
   * Prevents background tabs from extending sessions indefinitely.
   * @default 120_000 (2 minutes)
   */
  idleThresholdMs?: number;

  /**
   * Called when the heartbeat endpoint returns 401 — refresh token is gone.
   */
  onSessionExpired?: () => void;

  /**
   * Called after a successful refresh tick.
   */
  onRefreshed?: () => void;

  /**
   * Called on transient errors (network failure, 5xx). The hook keeps polling
   * — this is just an observability hook.
   */
  onError?: (error: Error) => void;

  /**
   * Namespace for the logger.
   * @default 'fides:heartbeat'
   */
  loggerNamespace?: string;
}

const DEFAULTS = {
  endpoint: '/api/auth/heartbeat',
  intervalMs: 5 * 60_000,
  idleThresholdMs: 2 * 60_000,
  loggerNamespace: 'fides:heartbeat',
} as const;

/**
 * Activity-driven session keepalive.
 *
 * Polls a server-side refresh endpoint at a fixed interval, but only when the
 * user has actually been active recently. Skips ticks when the tab is hidden,
 * and runs an immediate refresh when the tab regains focus after a long away.
 *
 * Intended to be paired with {@link useSessionMonitor}: the monitor *detects*
 * session loss; this hook *prevents* it for active users.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useHeartbeat, useSessionMonitor } from '@eventuras/fides-auth-next/store';
 *
 * function AuthProvider({ children }) {
 *   useSessionMonitor(authStore, checkAuthStatus);
 *   useHeartbeat({ onSessionExpired: () => authStore.send({ type: 'sessionExpired' }) });
 *   return <>{children}</>;
 * }
 * ```
 */
export function useHeartbeat(config: HeartbeatConfig = {}): void {
  const endpoint = config.endpoint ?? DEFAULTS.endpoint;
  const intervalMs = config.intervalMs ?? DEFAULTS.intervalMs;
  const idleThresholdMs = config.idleThresholdMs ?? DEFAULTS.idleThresholdMs;
  const loggerNamespace = config.loggerNamespace ?? DEFAULTS.loggerNamespace;

  // Keep callbacks stable across renders without re-running the effect.
  const callbacksRef = useRef({
    onSessionExpired: config.onSessionExpired,
    onRefreshed: config.onRefreshed,
    onError: config.onError,
  });
  callbacksRef.current = {
    onSessionExpired: config.onSessionExpired,
    onRefreshed: config.onRefreshed,
    onError: config.onError,
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const logger = Logger.create({
      namespace: loggerNamespace,
      context: { component: 'Heartbeat' },
    });

    const tracker: ActivityTracker = createActivityTracker();
    const abortController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastTickAt = Date.now();
    let stopped = false;

    const teardown = (): void => {
      if (stopped) return;
      stopped = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      abortController.abort();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      tracker.dispose();
    };

    const sendBeat = async (): Promise<void> => {
      if (stopped) return;

      // Skip while hidden — focus listener will catch up when tab returns.
      if (document.visibilityState === 'hidden') {
        logger.debug('Tab hidden, skipping heartbeat');
        return;
      }

      if (!tracker.isActiveWithin(idleThresholdMs)) {
        logger.debug({ idleThresholdMs }, 'No recent activity, skipping heartbeat');
        return;
      }

      lastTickAt = Date.now();
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          signal: abortController.signal,
        });

        // Component unmounted (or 401-driven teardown) during the fetch —
        // bail before touching callbacks so we don't fire on a dead consumer.
        if (stopped) return;

        if (response.status === 401) {
          logger.info('Heartbeat returned 401 — session expired');
          callbacksRef.current.onSessionExpired?.();
          // Tear down eagerly so listeners and tracker don't linger until unmount.
          teardown();
          return;
        }

        if (!response.ok) {
          throw new Error(`Heartbeat failed with status ${response.status}`);
        }

        logger.debug('Heartbeat refresh succeeded');
        callbacksRef.current.onRefreshed?.();
      } catch (error) {
        // Suppress AbortError-from-teardown and any error reported after stop.
        if (stopped) return;
        const err = error instanceof Error ? error : new Error(String(error));
        logger.warn({ error: err.message }, 'Heartbeat tick failed');
        callbacksRef.current.onError?.(err);
      }
    };

    const scheduleNext = (): void => {
      if (stopped) return;
      timeoutId = setTimeout(async () => {
        timeoutId = null;
        await sendBeat();
        scheduleNext();
      }, intervalMs);
    };

    function onVisibilityChange(): void {
      if (stopped) return;
      if (document.visibilityState !== 'visible') return;

      // Tab regained focus. If we've been away longer than one tick, beat now —
      // but cancel the pending tick first so we don't fire twice back-to-back.
      const sinceLast = Date.now() - lastTickAt;
      if (sinceLast >= intervalMs) {
        logger.debug({ sinceLast }, 'Tab regained focus after long away, beating now');
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        void sendBeat().then(scheduleNext);
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    scheduleNext();

    logger.debug({ intervalMs, idleThresholdMs, endpoint }, 'Heartbeat started');

    return () => {
      teardown();
      logger.debug('Heartbeat stopped');
    };
  }, [endpoint, intervalMs, idleThresholdMs, loggerNamespace]);
}

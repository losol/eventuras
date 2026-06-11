'use client';

import { useEffect, useRef } from 'react';
import {
  createActivityTracker,
  DEFAULT_ACTIVITY_EVENTS,
  type ActivityTracker,
} from '@eventuras/fides-auth/activity-tracker';
import { Logger } from '@eventuras/logger';

/**
 * Configuration for {@link useHeartbeat}.
 */
export interface HeartbeatConfig {
  /**
   * Endpoint to POST to in order to refresh the session.
   * The endpoint must run a server-side refresh and return 2xx with
   * `{ accessTokenExpiresAt }` (ISO 8601) on success, or 401 when the refresh
   * token is no longer valid.
   * @default '/api/auth/heartbeat'
   */
  endpoint?: string;

  /**
   * How much of the access-token lifetime to keep as headroom: the refresh is
   * scheduled when `fraction` of the TTL remains. Governs long tokens (a 1 h
   * token at 0.3 refreshes ~42 min in); short tokens are dominated by
   * {@link minSkewMs} instead.
   * @default 0.3
   */
  fraction?: number;

  /**
   * Absolute floor for the refresh lead time (network round-trip + clock skew).
   * Dominates for short-lived tokens: a 10 s token still refreshes ~5 s in.
   * @default 5_000 (5 seconds)
   */
  minSkewMs?: number;

  /**
   * Floor on how often a refresh may fire, so ultra-short tokens don't hammer
   * the endpoint.
   * @default 5_000 (5 seconds)
   */
  minRefreshIntervalMs?: number;

  /**
   * How recently the user must have interacted for a due refresh to fire.
   * Decoupled from the access-token TTL on purpose — this only suppresses
   * refreshes in genuinely abandoned tabs, so keep it generous (tie it to the
   * IdP's SSO/session idle, not the access token). When a refresh is suppressed
   * the hook waits for the next interaction (or tab focus) and refreshes then.
   * @default 1_800_000 (30 minutes)
   */
  idleThresholdMs?: number;

  /**
   * Known access-token expiry at mount (ISO 8601 string or epoch ms). When
   * provided, the first refresh is scheduled from it instead of priming with an
   * immediate refresh to discover the expiry.
   */
  initialExpiresAt?: string | number | null;

  /**
   * Called when the heartbeat endpoint returns 401 — refresh token is gone.
   */
  onSessionExpired?: () => void;

  /**
   * Called after a successful refresh.
   */
  onRefreshed?: () => void;

  /**
   * Called on transient errors (network failure, 5xx). The hook retries — this
   * is just an observability hook.
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
  fraction: 0.3,
  minSkewMs: 5_000,
  minRefreshIntervalMs: 5_000,
  idleThresholdMs: 30 * 60_000,
  loggerNamespace: 'fides:heartbeat',
} as const;

// Fallback cadence when a refresh succeeds but the response carries no usable
// expiry — keeps the session alive without busy-looping on an unknown TTL.
const FALLBACK_INTERVAL_MS = 60_000;
// Upper bound for exponential backoff between transient-failure retries.
const MAX_RETRY_DELAY_MS = 60_000;

/** Parses an ISO 8601 string or epoch-ms number into epoch ms, or null. */
function toEpochMs(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}

/**
 * Expiry-driven session keepalive.
 *
 * Schedules each refresh from the access token's actual expiry rather than a
 * fixed interval, so the cadence self-adjusts to whatever TTL the IdP issues: a
 * 5-minute token refreshes ~3.5 min in; a 10-second token refreshes ~5 s in
 * (skew floor). It primes with one refresh on mount to learn the current expiry
 * (pass {@link HeartbeatConfig.initialExpiresAt} to skip that), retries on
 * transient failure, and — for hidden or idle tabs — defers the refresh until
 * the tab is focused or the user interacts again.
 *
 * A 401 from the endpoint (refresh token / SSO session gone) is the logout
 * trigger via {@link HeartbeatConfig.onSessionExpired}; the idle gate is only an
 * optimization for abandoned tabs, never a gate on access-token freshness.
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
  const fraction = config.fraction ?? DEFAULTS.fraction;
  const minSkewMs = config.minSkewMs ?? DEFAULTS.minSkewMs;
  const minRefreshIntervalMs = config.minRefreshIntervalMs ?? DEFAULTS.minRefreshIntervalMs;
  const idleThresholdMs = config.idleThresholdMs ?? DEFAULTS.idleThresholdMs;
  const initialExpiresAt = toEpochMs(config.initialExpiresAt);
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
    let stopped = false;
    let primed = initialExpiresAt !== null;
    let expiresAt: number | null = initialExpiresAt;
    let failureCount = 0;
    let wakerArmed = false;

    const clearTimer = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const disarmWaker = (): void => {
      if (!wakerArmed) return;
      wakerArmed = false;
      for (const event of DEFAULT_ACTIVITY_EVENTS) {
        globalThis.removeEventListener(event, onWake);
      }
      document.removeEventListener('visibilitychange', onVisibleWake);
    };

    const teardown = (): void => {
      if (stopped) return;
      stopped = true;
      clearTimer();
      disarmWaker();
      abortController.abort();
      tracker.dispose();
    };

    // Time until the next refresh should fire, from the current known expiry.
    const nextDelay = (): number => {
      if (!primed) return 0; // prime now to discover the expiry
      if (expiresAt === null) return FALLBACK_INTERVAL_MS;
      const now = Date.now();
      const ttl = Math.max(0, expiresAt - now);
      const lead = Math.max(minSkewMs, fraction * ttl);
      return Math.max(minRefreshIntervalMs, expiresAt - lead - now);
    };

    const scheduleRefresh = (delay = nextDelay()): void => {
      if (stopped) return;
      clearTimer();
      timeoutId = setTimeout(onDue, delay);
    };

    function onWake(): void {
      if (stopped || !wakerArmed) return;
      disarmWaker();
      void onDue();
    }

    function onVisibleWake(): void {
      if (document.visibilityState !== 'visible') return;
      // Returning to the tab counts as activity, so a refresh deferred past
      // idleThresholdMs while hidden runs now instead of deferring again
      // (a visibility change does not touch the activity tracker on its own).
      tracker.recordActivity();
      onWake();
    }

    // Suspend refreshing until the tab is focused or the user interacts again.
    const deferUntilActive = (): void => {
      if (stopped || wakerArmed) return;
      wakerArmed = true;
      clearTimer();
      for (const event of DEFAULT_ACTIVITY_EVENTS) {
        globalThis.addEventListener(event, onWake, { passive: true });
      }
      document.addEventListener('visibilitychange', onVisibleWake);
    };

    async function onDue(): Promise<void> {
      if (stopped) return;
      timeoutId = null;

      // Hidden or abandoned: don't refresh now; wake on focus/interaction.
      if (document.visibilityState === 'hidden' || !tracker.isActiveWithin(idleThresholdMs)) {
        logger.debug('Refresh due but tab hidden/idle — deferring until active');
        deferUntilActive();
        return;
      }

      await beat();
    }

    async function beat(): Promise<void> {
      if (stopped) return;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          signal: abortController.signal,
        });

        // Unmounted (or 401-driven teardown) during the fetch — bail before
        // touching callbacks so we don't fire on a dead consumer.
        if (stopped) return;

        if (response.status === 401) {
          logger.info('Heartbeat returned 401 — session expired');
          callbacksRef.current.onSessionExpired?.();
          teardown();
          return;
        }

        if (!response.ok) {
          throw new Error(`Heartbeat failed with status ${response.status}`);
        }

        failureCount = 0;
        primed = true;
        const body = (await response.json().catch(() => null)) as
          | { accessTokenExpiresAt?: string | number | null }
          | null;
        expiresAt = toEpochMs(body?.accessTokenExpiresAt);

        logger.debug({ expiresAt }, 'Heartbeat refresh succeeded');
        callbacksRef.current.onRefreshed?.();
        scheduleRefresh();
      } catch (error) {
        if (stopped) return;
        const err = error instanceof Error ? error : new Error(String(error));
        logger.warn({ error: err.message }, 'Heartbeat tick failed, will retry');
        callbacksRef.current.onError?.(err);

        // Retry with capped exponential backoff; a real expiry resumes the
        // normal cadence once a tick succeeds.
        failureCount += 1;
        const backoff = Math.min(
          MAX_RETRY_DELAY_MS,
          minRefreshIntervalMs * 2 ** (failureCount - 1),
        );
        scheduleRefresh(backoff);
      }
    }

    scheduleRefresh();
    logger.debug(
      { fraction, minSkewMs, minRefreshIntervalMs, idleThresholdMs, endpoint, primed },
      'Heartbeat started',
    );

    return () => {
      teardown();
      logger.debug('Heartbeat stopped');
    };
  }, [
    endpoint,
    fraction,
    minSkewMs,
    minRefreshIntervalMs,
    idleThresholdMs,
    initialExpiresAt,
    loggerNamespace,
  ]);
}

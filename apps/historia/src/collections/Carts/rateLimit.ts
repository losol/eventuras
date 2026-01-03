import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:carts:rateLimit',
  context: { module: 'RateLimit' },
});

/**
 * In-memory rate limit tracker
 * Map structure: sessionId -> { count: number, resetAt: timestamp }
 */
const rateLimitMap = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  maxCarts: 5, // Maximum carts per time window
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
};

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Clean up expired rate limit entries (run periodically)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug({ cleaned }, 'Cleaned up expired rate limit entries');
  }
}

/**
 * Start periodic cleanup of expired rate limit entries.
 * This is idempotent and safe to call multiple times.
 */
export function startRateLimitCleanup(): void {
  if (cleanupIntervalId === null) {
    cleanupIntervalId = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
    logger.debug('Started rate limit cleanup interval');
  }
}

/**
 * Stop periodic cleanup of expired rate limit entries.
 * Useful for cleanup during hot reloads or shutdown.
 */
export function stopRateLimitCleanup(): void {
  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    logger.debug('Stopped rate limit cleanup interval');
  }
}

// Run cleanup every 5 minutes (managed via start/stop functions)
startRateLimitCleanup();

/**
 * Check if a session has exceeded the rate limit for cart creation
 *
 * @param sessionId - Unique identifier for the session (from session cookie)
 * @returns true if rate limit exceeded, false otherwise
 * @throws Error with user-friendly message if rate limit exceeded
 */
export function checkRateLimit(sessionId: string): void {
  const now = Date.now();
  const existing = rateLimitMap.get(sessionId);

  if (!existing || existing.resetAt < now) {
    // First request or window expired - create new entry
    rateLimitMap.set(sessionId, {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    });
    logger.debug({ sessionId }, 'Rate limit: First cart creation');
    return;
  }

  // Increment count
  existing.count++;

  if (existing.count > RATE_LIMIT_CONFIG.maxCarts) {
    const resetInMinutes = Math.ceil((existing.resetAt - now) / (60 * 1000));

    logger.warn(
      {
        sessionId,
        count: existing.count,
        resetInMinutes,
      },
      'Rate limit exceeded for cart creation',
    );

    throw new Error(
      `Too many cart creation attempts. Please try again in ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.`,
    );
  }

  logger.debug(
    {
      sessionId,
      count: existing.count,
      maxCarts: RATE_LIMIT_CONFIG.maxCarts,
    },
    'Rate limit check passed',
  );
}

/**
 * Get current rate limit status for a session (for debugging/monitoring)
 */
export function getRateLimitStatus(sessionId: string) {
  const existing = rateLimitMap.get(sessionId);
  const now = Date.now();

  if (!existing || existing.resetAt < now) {
    return {
      count: 0,
      maxCarts: RATE_LIMIT_CONFIG.maxCarts,
      resetAt: null,
    };
  }

  return {
    count: existing.count,
    maxCarts: RATE_LIMIT_CONFIG.maxCarts,
    resetAt: new Date(existing.resetAt).toISOString(),
  };
}

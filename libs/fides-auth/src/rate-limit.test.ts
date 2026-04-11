/**
 * Tests for TokenBucket rate limiter — production usage patterns:
 *
 * - Protecting login endpoints from brute force
 * - Per-IP or per-user rate limiting
 * - Token refilling over time
 */
import { TokenBucket } from './rate-limit';

// ────────────────────────────────────────────
// Basic consume / check behaviour
// ────────────────────────────────────────────

describe('TokenBucket — basic behaviour', () => {
  it('allows requests up to the max capacity', () => {
    const bucket = new TokenBucket<string>(5, 60);

    // Five requests should all succeed
    for (let i = 0; i < 5; i++) {
      expect(bucket.consume('user-1', 1)).toBe(true);
    }

    // Sixth should be rejected
    expect(bucket.consume('user-1', 1)).toBe(false);
  });

  it('check() does not consume tokens', () => {
    const bucket = new TokenBucket<string>(3, 60);

    // Check repeatedly — should always return true since no tokens consumed
    expect(bucket.check('user-1', 3)).toBe(true);
    expect(bucket.check('user-1', 3)).toBe(true);

    // Now consume all tokens
    expect(bucket.consume('user-1', 3)).toBe(true);
    expect(bucket.check('user-1', 1)).toBe(false);
  });

  it('check() returns true for a new (unseen) key', () => {
    const bucket = new TokenBucket<string>(10, 60);
    expect(bucket.check('new-key', 5)).toBe(true);
  });

  it('tracks different keys independently', () => {
    const bucket = new TokenBucket<string>(2, 60);

    // Exhaust tokens for user-1
    expect(bucket.consume('user-1', 2)).toBe(true);
    expect(bucket.consume('user-1', 1)).toBe(false);

    // user-2 should still have full capacity
    expect(bucket.consume('user-2', 2)).toBe(true);
  });

  it('rejects consume when cost exceeds remaining tokens', () => {
    const bucket = new TokenBucket<string>(5, 60);

    // First request costs 3 — leaves 2
    expect(bucket.consume('ip', 3)).toBe(true);
    // Next request costs 3 — only 2 left
    expect(bucket.consume('ip', 3)).toBe(false);
    // But a cost-2 request fits
    expect(bucket.consume('ip', 2)).toBe(true);
  });

  it('supports typed keys (e.g., numeric IDs)', () => {
    const bucket = new TokenBucket<number>(3, 60);

    expect(bucket.consume(1001, 2)).toBe(true);
    expect(bucket.consume(1001, 2)).toBe(false);
    expect(bucket.consume(1002, 3)).toBe(true);
  });
});

// ────────────────────────────────────────────
// Refilling
// ────────────────────────────────────────────

describe('TokenBucket — refilling', () => {
  it('refills tokens after the refill interval', () => {
    const bucket = new TokenBucket<string>(5, 1); // 1 second refill

    // Exhaust all tokens
    expect(bucket.consume('user', 5)).toBe(true);
    expect(bucket.consume('user', 1)).toBe(false);

    // Fast-forward time by 2 seconds (2 tokens should refill)
    vi.useFakeTimers();
    vi.advanceTimersByTime(2000);

    expect(bucket.consume('user', 2)).toBe(true);
    expect(bucket.consume('user', 1)).toBe(false);

    vi.useRealTimers();
  });

  it('refill never exceeds max capacity', () => {
    const bucket = new TokenBucket<string>(3, 1);

    // Use 1 token
    expect(bucket.consume('user', 1)).toBe(true);

    // Wait a long time — tokens should cap at max (3)
    vi.useFakeTimers();
    vi.advanceTimersByTime(100_000);

    // Should have 3 tokens (max), not 100+
    expect(bucket.consume('user', 3)).toBe(true);
    expect(bucket.consume('user', 1)).toBe(false);

    vi.useRealTimers();
  });

  it('check() accounts for refilled tokens', () => {
    const bucket = new TokenBucket<string>(5, 1);

    // Use all tokens
    bucket.consume('user', 5);
    expect(bucket.check('user', 1)).toBe(false);

    // After 3 seconds, should have 3 tokens
    vi.useFakeTimers();
    vi.advanceTimersByTime(3000);

    expect(bucket.check('user', 3)).toBe(true);
    expect(bucket.check('user', 4)).toBe(false);

    vi.useRealTimers();
  });
});

// ────────────────────────────────────────────
// Production scenario: login brute-force protection
// ────────────────────────────────────────────

describe('TokenBucket — login protection scenario', () => {
  it('allows 5 login attempts per minute, blocks the 6th', () => {
    const loginLimiter = new TokenBucket<string>(5, 60);
    const ip = '192.168.1.100';

    // First 5 attempts are fine
    for (let i = 0; i < 5; i++) {
      expect(loginLimiter.consume(ip, 1)).toBe(true);
    }

    // 6th attempt is blocked
    expect(loginLimiter.consume(ip, 1)).toBe(false);

    // But a different IP is unaffected
    expect(loginLimiter.consume('10.0.0.1', 1)).toBe(true);
  });

  it('allows retrying after the rate limit window passes', () => {
    vi.useFakeTimers();

    const loginLimiter = new TokenBucket<string>(3, 30); // 3 attempts per 30s
    const ip = '192.168.1.100';

    // Exhaust attempts
    loginLimiter.consume(ip, 3);
    expect(loginLimiter.consume(ip, 1)).toBe(false);

    // Wait 30 seconds — should get 1 token back
    vi.advanceTimersByTime(30_000);
    expect(loginLimiter.consume(ip, 1)).toBe(true);

    vi.useRealTimers();
  });
});

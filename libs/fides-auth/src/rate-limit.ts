/**
 * Token bucket rate limiter for protecting against brute-force attacks.
 *
 * Each key (e.g. IP address, user ID) gets its own bucket. Tokens refill
 * over time at a fixed interval. When a bucket is empty, requests are denied.
 *
 * @typeParam _Key - The type of key used to identify rate-limited entities
 *
 * @example
 * ```typescript
 * const limiter = new TokenBucket<string>(10, 60); // 10 tokens, refill 1/min
 *
 * if (!limiter.consume(ipAddress, 1)) {
 *   throw new Error('Rate limit exceeded');
 * }
 * ```
 */
export class TokenBucket<_Key> {
  public max: number;
  public refillIntervalSeconds: number;

  constructor(max: number, refillIntervalSeconds: number) {
    this.max = max;
    this.refillIntervalSeconds = refillIntervalSeconds;
  }

  private readonly storage = new Map<_Key, Bucket>();

  /** Check whether the bucket has enough tokens without consuming any. */
  public check(key: _Key, cost: number): boolean {
    const bucket = this.storage.get(key) ?? null;
    if (bucket === null) {
      return true;
    }
    const now = Date.now();
    const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000));
    if (refill > 0) {
      return Math.min(bucket.count + refill, this.max) >= cost;
    }
    return bucket.count >= cost;
  }

  /** Consume tokens from the bucket. Returns `true` if allowed, `false` if rate-limited. */
  public consume(key: _Key, cost: number): boolean {
    let bucket = this.storage.get(key) ?? null;
    const now = Date.now();
    if (bucket === null) {
      bucket = {
        count: this.max - cost,
        refilledAt: now,
      };
      this.storage.set(key, bucket);
      return true;
    }
    const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000));
    if (refill > 0) {
      bucket.count = Math.min(bucket.count + refill, this.max);
      bucket.refilledAt = now;
    }
    if (bucket.count < cost) {
      this.storage.set(key, bucket);
      return false;
    }
    bucket.count -= cost;
    this.storage.set(key, bucket);
    return true;
  }
}
interface Bucket {
  count: number;
  refilledAt: number;
}

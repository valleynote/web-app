type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 10_000;

function pruneIfNeeded() {
  if (buckets.size < MAX_KEYS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size < MAX_KEYS) return;
  // Drop oldest half if still oversized (single-instance safeguard).
  const keys = [...buckets.keys()].slice(0, Math.floor(buckets.size / 2));
  for (const key of keys) buckets.delete(key);
}

/**
 * Fixed-window rate limit (in-memory). Fine for a single app instance.
 * Returns retryAfterSec when limited.
 */
export function checkRateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: true; remaining: number } | { ok: false; retryAfterSec: number } {
  pruneIfNeeded();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1 };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: opts.limit - existing.count };
}

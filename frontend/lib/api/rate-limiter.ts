import { getRateLimitPolicy } from "@/lib/cache/policy";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export const RATE_LIMITS: Record<"public" | "admin" | "cron", RateLimitConfig> = {
  public: getRateLimitPolicy("public"),
  admin: getRateLimitPolicy("admin"),
  cron: getRateLimitPolicy("cron"),
};

function cleanupExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - 1),
      resetAt,
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - existing.count),
    resetAt: existing.resetAt,
  };
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Booking rate limit: 5 requests per hour per IP
export const bookingRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:booking",
});

// General API rate limit: 60 requests per minute per IP
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // If Redis is down, fail open (don't block users)
    return { success: true, remaining: 1, reset: Date.now() + 60000 };
  }
}

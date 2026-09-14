import { isIP } from "node:net";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 10;
export const MAX_RATE_LIMIT_ENTRIES = 500;

export function cleanupRateLimitMap(now: number): void {
  for (const [ipKey, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ipKey);
    }
  }
}

export function checkRateLimit(rawIp: string): RateLimitResult {
  const ip = typeof rawIp === "string" && isIP(rawIp.trim()) !== 0 ? rawIp.trim().toLowerCase() : "127.0.0.1";
  const now = Date.now();
  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    cleanupRateLimitMap(now);
    if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
      const toDelete = rateLimitMap.size - MAX_RATE_LIMIT_ENTRIES;
      let count = 0;
      for (const ipKey of rateLimitMap.keys()) {
        if (count >= toDelete) break;
        rateLimitMap.delete(ipKey);
        count++;
      }
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetAt });
    return {
      allowed: true,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}

export function resetRateLimits(): void {
  rateLimitMap.clear();
}

export function getRateLimitMapSize(): number {
  return rateLimitMap.size;
}

export function extractClientIp(req: { headers: { get(name: string): string | null } }): string {
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isIP(cfIp) !== 0) return cfIp.toLowerCase();

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp) !== 0) return realIp.toLowerCase();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const validCandidate = forwarded
      .split(",")
      .map((part) => part.trim())
      .find((part) => part.length > 0 && isIP(part) !== 0);
    if (validCandidate) return validCandidate.toLowerCase();
  }

  return "127.0.0.1";
}

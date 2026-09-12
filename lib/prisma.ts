import { PrismaClient } from "@prisma/client";
import net from "net";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn"],
  });

// Maintain strict singleton across all environments and hot reloads
globalForPrisma.prisma = prisma;

function getDatabaseHostAndPort(): { host: string; port: number } | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  try {
    const parsed = new URL(dbUrl);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
    };
  } catch {
    return { host: "127.0.0.1", port: 5432 };
  }
}

interface DbProbeCache {
  available: boolean;
  timestamp: number;
}

let cachedProbe: DbProbeCache | null = null;
let activeProbePromise: Promise<boolean> | null = null;

// Cache positive probe for 10 seconds, negative probe for 3 seconds
const POSITIVE_CACHE_TTL_MS = 10000;
const NEGATIVE_CACHE_TTL_MS = 3000;

export function invalidateDatabaseCache(): void {
  cachedProbe = null;
  activeProbePromise = null;
}

/**
 * Fast (~7ms) non-blocking socket probe to test if PostgreSQL is accepting connections.
 * Includes in-memory TTL caching and promise deduplication to ensure zero overhead
 * across concurrent requests on the pipeline.
 */
export function isDatabaseAvailable(
  timeoutMs = 150,
  force = false
): Promise<boolean> {
  const conn = getDatabaseHostAndPort();
  if (!conn) return Promise.resolve(false);

  const now = Date.now();

  // Return cached probe status if still within TTL
  if (!force && cachedProbe) {
    const ttl = cachedProbe.available
      ? POSITIVE_CACHE_TTL_MS
      : NEGATIVE_CACHE_TTL_MS;
    if (now - cachedProbe.timestamp < ttl) {
      return Promise.resolve(cachedProbe.available);
    }
  }

  // Deduplicate concurrent in-flight probes
  if (!force && activeProbePromise) {
    return activeProbePromise;
  }

  activeProbePromise = new Promise<boolean>((resolve) => {
    try {
      const socket = net.createConnection({ port: conn.port, host: conn.host });
      socket.setTimeout(timeoutMs);
      socket.unref();

      let settled = false;
      const finish = (result: boolean) => {
        if (!settled) {
          settled = true;
          socket.removeAllListeners();
          socket.destroy();
          cachedProbe = { available: result, timestamp: Date.now() };
          activeProbePromise = null;
          resolve(result);
        }
      };

      socket.on("connect", () => finish(true));
      socket.on("timeout", () => finish(false));
      socket.on("error", () => finish(false));
      socket.on("close", () => finish(false));
    } catch {
      cachedProbe = { available: false, timestamp: Date.now() };
      activeProbePromise = null;
      resolve(false);
    }
  });

  return activeProbePromise;
}

export default prisma;


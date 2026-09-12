import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_VERSION = "0.1.0";

export async function GET(req: NextRequest) {
  const isStrict = req.nextUrl.searchParams.get("strict") === "true";
  const forceProbe = isStrict || req.nextUrl.searchParams.get("fresh") === "true";
  const startTime = Date.now();
  const isPostgresUp = await isDatabaseAvailable(250, forceProbe);
  const dbLatencyMs = Date.now() - startTime;

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const memUsage = process.memoryUsage();

  // System is healthy if operational. When PostgreSQL is offline, system is degraded
  // because static research datasets and local decision trees remain fully operational.
  const status = isPostgresUp ? "ok" : "degraded";
  const httpStatus = isStrict && !isPostgresUp ? 503 : 200;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: APP_VERSION,
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: isPostgresUp ? "connected" : "disconnected",
          latencyMs: isPostgresUp ? dbLatencyMs : undefined,
          mode: isPostgresUp ? "postgresql" : "static_fallback",
        },
        gemini: {
          status: geminiConfigured ? "configured" : "unconfigured",
          model: geminiModel,
          mode: geminiConfigured ? "live_ai" : "local_fallback",
        },
      },
      system: {
        memory: {
          rssMb: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
          heapUsedMb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
        },
        nodeVersion: process.version,
      },
    },
    {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Service-Status": status,
      },
    }
  );
}

// Support HEAD requests for lightweight load balancer pings
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

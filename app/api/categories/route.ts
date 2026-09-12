import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  if (await isDatabaseAvailable()) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { title: "asc" },
      });

      if (categories.length > 0) {
        return NextResponse.json(categories, { headers: CACHE_HEADERS });
      }
    } catch (err: any) {
      console.warn("Database unavailable for categories query:", err.message);
    }
  }

  // Fallback if DB is empty or not yet connected
  const defaultCategories = [
    {
      slug: "wont-boot",
      title: "Won't boot",
      description: "Black screen, no POST, stuck on logo",
      severity: "critical",
    },
    {
      slug: "blue-screen",
      title: "Blue screen (BSOD)",
      description: "Crashes with a stop code",
      severity: "critical",
    },
    {
      slug: "running-slow",
      title: "Running slow",
      description: "Lag, freezes, long load times",
      severity: "warn",
    },
    {
      slug: "no-internet",
      title: "No internet",
      description: "Wi-Fi drops, no connection, slow speeds",
      severity: "warn",
    },
    {
      slug: "overheating",
      title: "Overheating",
      description: "Loud fans, thermal shutdowns",
      severity: "warn",
    },
    {
      slug: "driver-issues",
      title: "Driver issues",
      description: "GPU, audio, or peripheral not working",
      severity: "info",
    },
  ];

  return NextResponse.json(defaultCategories, { headers: CACHE_HEADERS });
}

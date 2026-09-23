import { NextRequest, NextResponse } from "next/server";
import { evaluatePriceAlerts } from "@/lib/parts/alerts/alert-runner";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If a cron secret is set in environment, enforce it for production security
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const report = await evaluatePriceAlerts();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Price alert evaluation failed", details: error.message },
      { status: 500 }
    );
  }
}

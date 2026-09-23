import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const guidesPath = path.join(process.cwd(), "data", "installation_guides.json");
    if (!fs.existsSync(guidesPath)) {
      return NextResponse.json({ success: true, count: 0, guides: [] });
    }

    const raw = fs.readFileSync(guidesPath, "utf-8");
    const guides = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      count: guides.length,
      guides: guides.map((g: any) => ({
        componentType: g.componentType,
        title: g.title,
        summary: g.summary,
        difficulty: g.difficulty,
        estimatedMinutes: g.estimatedMinutes,
        videoEmbedUrl: g.videoEmbedUrl,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to read installation guides", details: error.message },
      { status: 500 }
    );
  }
}

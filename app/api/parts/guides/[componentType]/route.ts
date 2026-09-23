import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { componentType: string } }
) {
  try {
    const targetType = params.componentType.toUpperCase();
    const guidesPath = path.join(process.cwd(), "data", "installation_guides.json");

    if (!fs.existsSync(guidesPath)) {
      return NextResponse.json({ success: false, error: "Installation guides file missing" }, { status: 404 });
    }

    const raw = fs.readFileSync(guidesPath, "utf-8");
    const guides = JSON.parse(raw);
    const guide = guides.find((g: any) => g.componentType.toUpperCase() === targetType);

    if (!guide) {
      return NextResponse.json(
        {
          success: false,
          error: `Guide for component type '${targetType}' not found`,
          availableTypes: guides.map((g: any) => g.componentType),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guide,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch installation guide", details: error.message },
      { status: 500 }
    );
  }
}

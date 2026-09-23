import { NextRequest, NextResponse } from "next/server";
import { getPartBySlug } from "@/lib/parts/repository";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const part = await getPartBySlug(slug);

    if (!part) {
      return NextResponse.json(
        { success: false, error: `Part '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      part,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch part details", details: error.message },
      { status: 500 }
    );
  }
}

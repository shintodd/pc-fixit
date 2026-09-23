import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, getPartBySlug } from "@/lib/parts/repository";

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

    const history = await getPriceHistory(part.id);

    return NextResponse.json({
      success: true,
      partSlug: part.slug,
      partName: part.name,
      currentPriceMyr: part.bestPriceMyr,
      history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch price history", details: error.message },
      { status: 500 }
    );
  }
}

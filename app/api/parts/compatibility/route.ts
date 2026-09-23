import { NextRequest, NextResponse } from "next/server";
import { checkCompatibility } from "@/lib/parts/compatibility/checker";
import { BuildSelection, PartItem } from "@/lib/parts/types";
import { getPartBySlug } from "@/lib/parts/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let selection: BuildSelection = {};

    // Support both direct BuildSelection or array of part slugs / IDs
    if (body.selection) {
      selection = body.selection;
    } else if (Array.isArray(body.partSlugs) || Array.isArray(body.parts)) {
      const slugs: string[] = body.partSlugs || body.parts;
      for (const slug of slugs) {
        if (!slug) continue;
        const part = await getPartBySlug(slug);
        if (part) {
          const key = part.type.toLowerCase() as keyof BuildSelection;
          selection[key] = part;
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Missing 'selection' object or 'partSlugs' array in request body" },
        { status: 400 }
      );
    }

    const report = checkCompatibility(selection);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Compatibility check failed", details: error.message },
      { status: 500 }
    );
  }
}

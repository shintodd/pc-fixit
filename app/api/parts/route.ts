import { NextRequest, NextResponse } from "next/server";
import { getAllParts } from "@/lib/parts/repository";
import { ComponentType } from "@/lib/parts/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as ComponentType | null;
    const brand = searchParams.get("brand") || undefined;
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const search = searchParams.get("q") || searchParams.get("search") || undefined;

    const parts = await getAllParts({
      type: type || undefined,
      brand,
      inStockOnly,
      minPrice,
      maxPrice,
      search,
    });

    return NextResponse.json({
      success: true,
      count: parts.length,
      parts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve parts catalog", details: error.message },
      { status: 500 }
    );
  }
}

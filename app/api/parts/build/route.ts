import { NextRequest, NextResponse } from "next/server";
import { generateSmartBuild } from "@/lib/parts/build-generator/generator";
import { UseCase } from "@/lib/parts/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const budgetMyr = Number(body.budget || body.budgetMyr || 3500);
    const useCase: UseCase = body.useCase || "gaming";
    const marketPreference = body.marketPreference || "new";
    const preferredFormFactor = body.preferredFormFactor;
    const preferredChipBrand = body.preferredChipBrand;
    const inStockOnly = body.inStockOnly !== false;

    if (isNaN(budgetMyr) || budgetMyr < 1500) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget too low for a functional compatible PC build. Minimum recommended budget in Malaysia is RM1,500.",
          minimumBudgetMyr: 1500,
        },
        { status: 400 }
      );
    }

    const result = await generateSmartBuild({
      budgetMyr,
      useCase,
      marketPreference,
      preferredFormFactor,
      preferredChipBrand,
      inStockOnly,
    });

    return NextResponse.json({
      success: true,
      build: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to generate build recommendation", details: error.message },
      { status: 500 }
    );
  }
}

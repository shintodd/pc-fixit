import { BuildSelection, ComponentType, MarketPreference, UseCase } from "@/lib/parts/types";
import { CompatibilityReport } from "@/lib/parts/compatibility/types";

export interface BuildGeneratorRequest {
  budgetMyr: number;
  useCase: UseCase;
  marketPreference?: MarketPreference; // "new" | "used" | "hybrid" (defaults to "new")
  preferredFormFactor?: "ATX" | "Micro-ATX" | "Mini-ITX";
  preferredChipBrand?: "AMD" | "NVIDIA" | "Intel";
  inStockOnly?: boolean;
}

export interface CategoryAllocation {
  componentType: ComponentType;
  allocatedMyr: number;
  actualMyr: number;
  condition?: "new" | "used_excellent" | "used_good" | "refurbished";
  selectedRetailer?: string;
  selectedProductUrl?: string;
  sellerLocation?: string;
}

export interface BuildGeneratorResult {
  success: boolean;
  budgetMyr: number;
  useCase: UseCase;
  marketPreference: MarketPreference;
  totalPriceMyr: number;
  remainingBudgetMyr: number;
  selection: BuildSelection;
  allocations: CategoryAllocation[];
  reallocationNotes: string[];
  compatibility: CompatibilityReport;
  overallValueScore: number;
}

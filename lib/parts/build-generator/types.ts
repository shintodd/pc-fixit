import { BuildSelection, ComponentType, UseCase } from "@/lib/parts/types";
import { CompatibilityReport } from "@/lib/parts/compatibility/types";

export interface BuildGeneratorRequest {
  budgetMyr: number;
  useCase: UseCase;
  preferredFormFactor?: "ATX" | "Micro-ATX" | "Mini-ITX";
  preferredChipBrand?: "AMD" | "NVIDIA" | "Intel";
  inStockOnly?: boolean;
}

export interface CategoryAllocation {
  componentType: ComponentType;
  allocatedMyr: number;
  actualMyr: number;
}

export interface BuildGeneratorResult {
  success: boolean;
  budgetMyr: number;
  useCase: UseCase;
  totalPriceMyr: number;
  remainingBudgetMyr: number;
  selection: BuildSelection;
  allocations: CategoryAllocation[];
  reallocationNotes: string[];
  compatibility: CompatibilityReport;
  overallValueScore: number;
}

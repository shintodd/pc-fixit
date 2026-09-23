import { ComponentType, PartItem, UseCase, BuildSelection, CpuSpecs, MotherboardSpecs, GpuSpecs } from "@/lib/parts/types";
import { checkCompatibility } from "@/lib/parts/compatibility/checker";
import { BuildGeneratorRequest, BuildGeneratorResult, CategoryAllocation } from "@/lib/parts/build-generator/types";
import { getAllParts } from "@/lib/parts/repository";

/**
 * BASE USE-CASE BUDGET DISTRIBUTION MATRIX (%)
 * Dynamically tailored to performance priorities per workload.
 */
const BASE_RATIOS: Record<UseCase, Record<ComponentType, number>> = {
  gaming: {
    GPU: 0.40,
    CPU: 0.20,
    MOTHERBOARD: 0.11,
    RAM: 0.08,
    STORAGE: 0.07,
    PSU: 0.07,
    CASE: 0.04,
    COOLER: 0.03,
  },
  workstation: {
    CPU: 0.30,
    RAM: 0.16,
    GPU: 0.22,
    STORAGE: 0.10,
    MOTHERBOARD: 0.10,
    PSU: 0.06,
    COOLER: 0.04,
    CASE: 0.02,
  },
  streaming: {
    GPU: 0.35,
    CPU: 0.24,
    RAM: 0.12,
    MOTHERBOARD: 0.10,
    STORAGE: 0.07,
    PSU: 0.06,
    COOLER: 0.03,
    CASE: 0.03,
  },
  budget: {
    CPU: 0.28,
    GPU: 0.30,
    MOTHERBOARD: 0.14,
    RAM: 0.09,
    STORAGE: 0.08,
    PSU: 0.06,
    CASE: 0.03,
    COOLER: 0.02,
  },
};

/**
 * VALUE-RANKING FORMULA (Price-to-Performance Index):
 *
 *   PPR (Points Per Ringgit) = benchmarkScore / priceMyr
 *
 * For a given target budget slice:
 * 1. Filter candidate parts that match active socket, form factor, and RAM generation constraints.
 * 2. Filter parts where priceMyr <= sliceBudget * 1.30 (allow small overflow if compensated elsewhere).
 * 3. Composite Score = (PPR * 0.45) + (Normalized Benchmark Score * 0.55).
 *    This prevents budget builds from always picking underpowered 10-year-old chips with high theoretical PPR,
 *    ensuring modern platform viability while maximizing efficiency per MYR.
 */
function scorePartValue(part: PartItem, targetSlice: number, maxScoreInCategory: number): number {
  if (part.bestPriceMyr <= 0) return 0;
  const ppr = part.benchmarkScore / part.bestPriceMyr;
  const normalizedPerf = maxScoreInCategory > 0 ? (part.benchmarkScore / maxScoreInCategory) * 100 : 50;
  const budgetFitPenalty = part.bestPriceMyr > targetSlice ? 0.85 : 1.0;
  return (ppr * 0.45 + normalizedPerf * 0.55) * budgetFitPenalty;
}

export async function generateSmartBuild(req: BuildGeneratorRequest): Promise<BuildGeneratorResult> {
  const budget = Math.max(1500, req.budgetMyr);
  const useCase = req.useCase || "gaming";
  const marketPreference = req.marketPreference || "new";
  const reallocationNotes: string[] = [];

  if (marketPreference === "hybrid") {
    reallocationNotes.push(
      "Smart Hybrid Strategy: Power Supply (PSU) and NVMe Storage are strictly brand-new with manufacturer warranty for electrical safety and 100% NAND drive endurance. Core compute (CPU, GPU, RAM, Motherboard) leverages tested second-hand market listings to maximize performance per ringgit."
    );
  } else if (marketPreference === "used") {
    reallocationNotes.push(
      "Second-Hand Value Maximizer: Utilizing Malaysian pre-owned market (Carousell MY, Mudah.my, Lowyat Garage) across all components for maximum hardware horsepower within budget."
    );
  }

  const rawParts = await getAllParts({ inStockOnly: req.inStockOnly !== false });

  // Map parts with effective price based on market preference
  const allParts = rawParts.map((p) => {
    let effectivePrice = p.bestPriceMyr;
    let isUsedChoice = false;

    if (marketPreference === "new") {
      effectivePrice = p.bestNewPriceMyr || p.bestPriceMyr;
    } else if (marketPreference === "used") {
      if (p.hasUsedListings && p.bestUsedPriceMyr) {
        effectivePrice = p.bestUsedPriceMyr;
        isUsedChoice = true;
      } else {
        effectivePrice = p.bestNewPriceMyr || p.bestPriceMyr;
      }
    } else if (marketPreference === "hybrid") {
      // PSU and Storage strictly brand new
      if (p.type === "PSU" || p.type === "STORAGE") {
        effectivePrice = p.bestNewPriceMyr || p.bestPriceMyr;
      } else if (p.hasUsedListings && p.bestUsedPriceMyr) {
        effectivePrice = p.bestUsedPriceMyr;
        isUsedChoice = true;
      } else {
        effectivePrice = p.bestNewPriceMyr || p.bestPriceMyr;
      }
    }

    return {
      ...p,
      bestPriceMyr: effectivePrice,
      isUsedSelection: isUsedChoice,
    };
  });

  // Group by component type
  const catalog: Record<ComponentType, typeof allParts> = {
    CPU: allParts.filter((p) => p.type === "CPU"),
    GPU: allParts.filter((p) => p.type === "GPU"),
    MOTHERBOARD: allParts.filter((p) => p.type === "MOTHERBOARD"),
    RAM: allParts.filter((p) => p.type === "RAM"),
    STORAGE: allParts.filter((p) => p.type === "STORAGE"),
    PSU: allParts.filter((p) => p.type === "PSU"),
    CASE: allParts.filter((p) => p.type === "CASE"),
    COOLER: allParts.filter((p) => p.type === "COOLER"),
  };

  const ratios = { ...BASE_RATIOS[useCase] };

  // Calculate target slice per component
  const slices: Record<ComponentType, number> = {} as any;
  (Object.keys(ratios) as ComponentType[]).forEach((type) => {
    slices[type] = Math.round(budget * ratios[type]);
  });

  // Dynamic Market Spike Detection:
  // Check if minimum viable modern parts in high-priority categories exceed slice budget
  const minGpuPrice = Math.min(...catalog.GPU.map((g) => g.bestPriceMyr), 9999);
  const minRamPrice = Math.min(...catalog.RAM.map((r) => r.bestPriceMyr), 9999);

  if (minGpuPrice > slices.GPU * 1.15 && budget >= 3000) {
    const shift = Math.round(slices.COOLER * 0.4 + slices.CASE * 0.3);
    slices.GPU += shift;
    slices.COOLER -= Math.round(shift * 0.6);
    slices.CASE -= Math.round(shift * 0.4);
    reallocationNotes.push(
      `Market reallocation: GPU prices elevated in current stock. Shifted RM${shift} from case and cooling allowance to preserve target gaming GPU tier.`
    );
  }

  if (minRamPrice > slices.RAM * 1.25) {
    const shift = Math.round(slices.MOTHERBOARD * 0.15);
    slices.RAM += shift;
    slices.MOTHERBOARD -= shift;
    reallocationNotes.push(
      `Market reallocation: RAM prices elevated (+${Math.round((minRamPrice / slices.RAM - 1) * 100)}%). Allocated high-value memory module and rebalanced motherboard target.`
    );
  }

  // Selection Phase with Strict Constraint Propagation
  const selection: BuildSelection = {};

  // 1. Pick CPU first (determines socket for Motherboard and Cooler)
  const maxCpuScore = Math.max(...catalog.CPU.map((c) => c.benchmarkScore), 1);
  const sortedCpus = [...catalog.CPU].sort(
    (a, b) => scorePartValue(b, slices.CPU, maxCpuScore) - scorePartValue(a, slices.CPU, maxCpuScore)
  );
  selection.cpu = sortedCpus.find((c) => c.bestPriceMyr <= slices.CPU * 1.25) || sortedCpus[sortedCpus.length - 1];

  const cpuSocket = (selection.cpu?.specs as CpuSpecs)?.socket;

  // 2. Pick Motherboard (must match cpuSocket)
  const compatibleMobos = catalog.MOTHERBOARD.filter(
    (m) => (m.specs as MotherboardSpecs).socket.toUpperCase() === cpuSocket?.toUpperCase()
  );
  const sortedMobos = compatibleMobos.sort(
    (a, b) => Math.abs(a.bestPriceMyr - slices.MOTHERBOARD) - Math.abs(b.bestPriceMyr - slices.MOTHERBOARD)
  );
  selection.motherboard = sortedMobos.find((m) => m.bestPriceMyr <= slices.MOTHERBOARD * 1.25) || sortedMobos[0];

  const moboRamType = (selection.motherboard?.specs as MotherboardSpecs)?.ramType;

  // 3. Pick RAM (must match moboRamType)
  const compatibleRam = catalog.RAM.filter(
    (r) => (r.specs as any).ramType?.toUpperCase() === moboRamType?.toUpperCase()
  );
  const sortedRam = compatibleRam.sort(
    (a, b) => Math.abs(a.bestPriceMyr - slices.RAM) - Math.abs(b.bestPriceMyr - slices.RAM)
  );
  selection.ram = sortedRam.find((r) => r.bestPriceMyr <= slices.RAM * 1.3) || sortedRam[0];

  // 4. Pick GPU (check remaining budget headroom)
  const maxGpuScore = Math.max(...catalog.GPU.map((g) => g.benchmarkScore), 1);
  const sortedGpus = [...catalog.GPU].sort(
    (a, b) => scorePartValue(b, slices.GPU, maxGpuScore) - scorePartValue(a, slices.GPU, maxGpuScore)
  );
  selection.gpu = sortedGpus.find((g) => g.bestPriceMyr <= slices.GPU * 1.2) || sortedGpus[sortedGpus.length - 1];

  // 5. Pick Storage
  const sortedStorage = [...catalog.STORAGE].sort(
    (a, b) => Math.abs(a.bestPriceMyr - slices.STORAGE) - Math.abs(b.bestPriceMyr - slices.STORAGE)
  );
  selection.storage = sortedStorage[0];

  // 6. Pick Case
  const gpuLength = (selection.gpu?.specs as GpuSpecs)?.lengthMm || 240;
  const moboFormFactor = (selection.motherboard?.specs as MotherboardSpecs)?.formFactor || "ATX";
  const compatibleCases = catalog.CASE.filter((c) => {
    const specs = c.specs as any;
    const supportsMobo = specs.formFactorSupport.some((ff: string) => ff.toLowerCase() === moboFormFactor.toLowerCase());
    const fitsGpu = specs.maxGpuLengthMm >= gpuLength;
    return supportsMobo && fitsGpu;
  });
  selection.case = compatibleCases.sort((a, b) => a.bestPriceMyr - b.bestPriceMyr)[0] || catalog.CASE[0];

  // 7. Pick Cooler (must match cpuSocket)
  const cpuIncludesCooler = (selection.cpu?.specs as CpuSpecs)?.coolerIncluded;
  const compatibleCoolers = catalog.COOLER.filter((c) => {
    const sockets = (c.specs as any).supportedSockets || [];
    return sockets.some((s: string) => s.toUpperCase() === cpuSocket?.toUpperCase());
  });

  // If budget tier is tight (<= RM2,800) and CPU comes with stock cooler, use stock cooler
  if (budget <= 2800 && cpuIncludesCooler) {
    selection.cooler = null;
    reallocationNotes.push("Using AMD/Intel boxed thermal solution to maximize GPU allocation on budget constraint.");
  } else {
    selection.cooler = compatibleCoolers.sort((a, b) => a.bestPriceMyr - b.bestPriceMyr)[0] || null;
  }

  // 8. Pick PSU (calculate estimated power draw of selected CPU + GPU + buffer)
  const prelimReport = checkCompatibility(selection);
  const neededPsuWattage = prelimReport.recommendedPsuWattage;
  const compatiblePsus = catalog.PSU.filter((p) => (p.specs as any).wattage >= neededPsuWattage);
  selection.psu = compatiblePsus.sort((a, b) => a.bestPriceMyr - b.bestPriceMyr)[0] || catalog.PSU[catalog.PSU.length - 1];

  // 9. Post-Selection Budget Balancing Pass:
  // If total price exceeds target budget by > 2%, adjust components downward to fit cleanly
  let currentTotal = Object.values(selection).reduce((acc, p) => acc + (p?.bestPriceMyr || 0), 0);
  if (currentTotal > budget * 1.02) {
    // If RAM is 32GB on a budget build, step down to 16GB
    if (budget <= 3000 && selection.ram && (selection.ram.specs as any).capacityGb > 16) {
      const budgetRam = catalog.RAM.find(
        (r) =>
          (r.specs as any).ramType === (selection.motherboard?.specs as any).ramType &&
          (r.specs as any).capacityGb === 16
      );
      if (budgetRam) {
        selection.ram = budgetRam;
        currentTotal = Object.values(selection).reduce((acc, p) => acc + (p?.bestPriceMyr || 0), 0);
        reallocationNotes.push("Selected high-value 16GB dual-channel memory kit to preserve target budget.");
      }
    }

    // Step down case to lowest compatible chassis
    if (currentTotal > budget * 1.02 && selection.case) {
      const cheapestCase = compatibleCases.sort((a, b) => a.bestPriceMyr - b.bestPriceMyr)[0];
      if (cheapestCase && cheapestCase.id !== selection.case.id) {
        selection.case = cheapestCase;
      }
    }
  }

  // Run full final deterministic compatibility verification
  const finalCompatibility = checkCompatibility(selection);

  // Compute actual spent and category allocations
  const allocations: CategoryAllocation[] = (Object.keys(slices) as ComponentType[]).map((type) => {
    const selectedItem = (selection as any)[type.toLowerCase()] as PartItem | null;
    const isUsed = Boolean((selectedItem as any)?.isUsedSelection);
    const targetCond = isUsed ? "used" : "new";

    // Match quote by condition and price
    const condQuotes = (selectedItem?.prices || []).filter((q) =>
      targetCond === "new" ? q.condition === "new" : q.condition !== "new"
    );
    const matchingQuote =
      condQuotes.find((q) => q.priceMyr === selectedItem?.bestPriceMyr) ||
      condQuotes.sort((a, b) => a.priceMyr - b.priceMyr)[0] ||
      selectedItem?.prices[0];

    // Reorder selectedItem.prices so the chosen quote is guaranteed at index 0
    if (selectedItem && matchingQuote) {
      selectedItem.prices = [
        matchingQuote,
        ...selectedItem.prices.filter((q) => q !== matchingQuote),
      ];
    }

    return {
      componentType: type,
      allocatedMyr: slices[type],
      actualMyr: selectedItem?.bestPriceMyr || 0,
      condition: isUsed ? (matchingQuote?.condition as any || "used_good") : "new",
      selectedRetailer: matchingQuote?.retailerName,
      selectedProductUrl: matchingQuote?.productUrl,
      sellerLocation: matchingQuote?.sellerLocation,
    };
  });

  const totalPriceMyr = allocations.reduce((sum, a) => sum + a.actualMyr, 0);
  const remainingBudgetMyr = budget - totalPriceMyr;

  // Calculate overall value rating (average score weighted by performance parts)
  const cpuWeight = (selection.cpu?.benchmarkScore || 0) * 0.4;
  const gpuWeight = (selection.gpu?.benchmarkScore || 0) * 0.6;
  const overallValueScore = Math.round((cpuWeight + gpuWeight) / 100);

  return {
    success: finalCompatibility.isCompatible,
    budgetMyr: budget,
    useCase,
    marketPreference,
    totalPriceMyr,
    remainingBudgetMyr,
    selection,
    allocations,
    reallocationNotes,
    compatibility: finalCompatibility,
    overallValueScore,
  };
}

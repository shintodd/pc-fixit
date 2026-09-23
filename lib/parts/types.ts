export type ComponentType =
  | "CPU"
  | "GPU"
  | "MOTHERBOARD"
  | "RAM"
  | "STORAGE"
  | "PSU"
  | "CASE"
  | "COOLER";

export type UseCase = "gaming" | "workstation" | "budget" | "streaming";

export interface CpuSpecs {
  socket: "AM5" | "AM4" | "LGA1700" | "LGA1851" | string;
  tdpWattage: number;
  cores: number;
  threads: number;
  baseClockGhz?: number;
  boostClockGhz?: number;
  integratedGpu: boolean;
  coolerIncluded: boolean;
}

export interface GpuSpecs {
  chipBrand: "NVIDIA" | "AMD" | "Intel";
  vramGb: number;
  lengthMm: number;
  slotWidth: number;
  tdpWattage: number;
  recommendedPsuWattage: number;
  powerConnectors: string; // e.g. "1x 16-pin 12VHPWR" or "2x 8-pin"
  has12Vhpwr?: boolean;
}

export interface MotherboardSpecs {
  socket: "AM5" | "AM4" | "LGA1700" | "LGA1851" | string;
  chipset: string;
  formFactor: "ATX" | "Micro-ATX" | "Mini-ITX";
  ramType: "DDR4" | "DDR5";
  ramSlots: number;
  maxRamSpeedMhz: number;
  m2Slots: number;
  sataPorts: number;
  pcieGen: number;
}

export interface RamSpecs {
  ramType: "DDR4" | "DDR5";
  capacityGb: number;
  moduleCount: number; // e.g. 2 for 2x16GB
  speedMhz: number;
  casLatency?: number;
}

export interface StorageSpecs {
  formFactor: "M.2 2280" | "2.5-inch SATA" | "3.5-inch SATA";
  interface: "NVMe PCIe 4.0" | "NVMe PCIe 3.0" | "NVMe PCIe 5.0" | "SATA III";
  capacityGb: number;
  readSpeedMbps?: number;
}

export interface PsuSpecs {
  wattage: number;
  efficiencyRating: "80+ Bronze" | "80+ Gold" | "80+ Platinum" | "80+ Standard";
  formFactor: "ATX" | "SFX";
  modularity: "Full" | "Semi" | "Non";
  has12Vhpwr: boolean;
}

export interface CaseSpecs {
  formFactorSupport: ("ATX" | "Micro-ATX" | "Mini-ITX")[];
  maxGpuLengthMm: number;
  maxCpuCoolerHeightMm: number;
  maxPsuLengthMm?: number;
}

export interface CoolerSpecs {
  coolerType: "Air" | "AIO 240" | "AIO 360";
  supportedSockets: string[];
  heightMm: number; // For air coolers, or radiator thickness for AIO
  maxTdpWattage: number;
}

export type PartSpecs =
  | CpuSpecs
  | GpuSpecs
  | MotherboardSpecs
  | RamSpecs
  | StorageSpecs
  | PsuSpecs
  | CaseSpecs
  | CoolerSpecs;

export type ItemCondition = "new" | "used_excellent" | "used_good" | "refurbished";
export type MarketPreference = "new" | "used" | "hybrid";

export interface RetailerQuote {
  retailerId: string;
  retailerName: string;
  retailerSlug: string;
  priceMyr: number;
  originalPriceMyr?: number;
  condition: ItemCondition;
  sellerLocation?: string;
  listingTitle?: string;
  isMarketplace?: boolean;
  inStock: boolean;
  stockQuantity?: number;
  productUrl: string;
  lastScrapedAt: string;
}

export interface MarketPriceRange {
  newRange?: { min: number; max: number; typical: number };
  usedRange?: { min: number; max: number; typical: number };
  fairTargetPriceMyr: number;
  availability: "abundant" | "moderate" | "scarce" | "discontinued_used_only";
}

export type TierRanking = "S" | "A" | "B" | "C" | "D";
export type SourcingRecommendation = "must_buy_used" | "safe_buy_new" | "skip_poor_value" | "enthusiast_tier";
export type TargetResolution = "1080p Budget" | "1080p High" | "1440p Sweet Spot" | "4K Enthusiast" | "Workstation / Production";

export interface PartOpinion {
  verdict: string;
  recommendation: SourcingRecommendation;
  recommendationLabel: string;
  pros: string[];
  cons: string[];
  targetResolution?: TargetResolution;
  upgradeAdvice: string;
  tierRanking: TierRanking;
}

export interface PartItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  type: ComponentType;
  specs: PartSpecs;
  benchmarkScore: number;
  imageUrl?: string;
  bestPriceMyr: number;
  bestNewPriceMyr?: number;
  bestUsedPriceMyr?: number;
  hasUsedListings: boolean;
  inStock: boolean;
  prices?: RetailerQuote[];
  marketPricing?: MarketPriceRange;
  opinion?: PartOpinion;
}

export interface BuildSelection {
  cpu?: PartItem | null;
  gpu?: PartItem | null;
  motherboard?: PartItem | null;
  ram?: PartItem | null;
  storage?: PartItem | null;
  psu?: PartItem | null;
  case?: PartItem | null;
  cooler?: PartItem | null;
}

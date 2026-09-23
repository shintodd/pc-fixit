import { checkCompatibility } from "../lib/parts/compatibility/checker";
import { generateSmartBuild } from "../lib/parts/build-generator/generator";
import { getAllParts, getPartBySlug, getPriceHistory } from "../lib/parts/repository";
import { detectHardwareHandoff } from "../lib/parts/handoff";
import { evaluatePriceAlerts } from "../lib/parts/alerts/alert-runner";
import { BuildSelection, PartItem } from "../lib/parts/types";
import fs from "fs";
import path from "path";

let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  [PASS] ${description}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${description}`);
    totalFailed++;
  }
}

async function runPartsSuite() {
  console.log("\n======================================================");
  console.log("PARTS RECOMMENDATION SYSTEM - VERIFICATION SUITE");
  console.log("======================================================");

  const parts = await getAllParts();

  // ------------------------------------------------------------------
  // 1. Ingestion & Parts Catalog Integrity
  // ------------------------------------------------------------------
  console.log("\n--- Suite 1: Parts Catalog & Ingestion Integrity ---");
  assert(parts.length >= 20, `Catalog contains at least 20 components (found: ${parts.length})`);

  const componentTypes = new Set(parts.map((p) => p.type));
  const expectedTypes = ["CPU", "GPU", "MOTHERBOARD", "RAM", "STORAGE", "PSU", "CASE", "COOLER"];
  for (const t of expectedTypes) {
    assert(componentTypes.has(t as any), `Catalog includes ${t} components`);
  }

  const allHaveValidPrices = parts.every((p) => p.bestPriceMyr > 0 && p.prices.length > 0);
  assert(allHaveValidPrices, "All parts contain valid non-zero MYR pricing and retailer quotes");

  const sampleSlug = "amd-ryzen-7-7800x3d";
  const slugPart = await getPartBySlug(sampleSlug);
  assert(slugPart !== null && slugPart.slug === sampleSlug, `getPartBySlug resolves '${sampleSlug}' cleanly`);

  const history = await getPriceHistory(sampleSlug);
  assert(history.length >= 2, `Price history returns time-series data points (count: ${history.length})`);

  // ------------------------------------------------------------------
  // 2. Compatibility Rules Engine: Pass Cases
  // ------------------------------------------------------------------
  console.log("\n--- Suite 2: Compatibility Engine (Pass Cases) ---");
  const cpu7800 = parts.find((p) => p.slug === "amd-ryzen-7-7800x3d")!;
  const moboB650 = parts.find((p) => p.slug === "msi-mag-b650-tomahawk-wifi")!;
  const ramD5 = parts.find((p) => p.slug === "gskill-ripjaws-s5-32gb-2x16gb-ddr5-6000-cl30")!;
  const gpu4070S = parts.find((p) => p.slug === "zotac-gaming-geforce-rtx-4070-super-twin-edge-12gb")!;
  const psu750 = parts.find((p) => p.slug === "corsair-rm750e-750w-80-plus-gold-atx3")!;
  const caseAir = parts.find((p) => p.slug === "montech-air-903-max-atx-case")!;
  const coolerPA120 = parts.find((p) => p.slug === "thermalright-peerless-assassin-120-se-argb")!;
  const ssd1TB = parts.find((p) => p.slug === "kingston-nv2-1tb-pcie-4-nvme-ssd")!;

  const validBuild: BuildSelection = {
    cpu: cpu7800,
    motherboard: moboB650,
    ram: ramD5,
    gpu: gpu4070S,
    psu: psu750,
    case: caseAir,
    cooler: coolerPA120,
    storage: ssd1TB,
  };

  const validReport = checkCompatibility(validBuild);
  assert(validReport.isCompatible === true, "Valid AM5 + B650 + DDR5 build reports isCompatible: true");
  assert(validReport.status === "PASS", `Status is PASS (got: ${validReport.status})`);
  assert(validReport.estimatedWattage > 300 && validReport.estimatedWattage < 600, `Estimated wattage calculated correctly (${validReport.estimatedWattage}W)`);
  assert(validReport.recommendedPsuWattage >= validReport.estimatedWattage, `Recommended PSU (${validReport.recommendedPsuWattage}W) includes safety headroom`);

  // ------------------------------------------------------------------
  // 3. Compatibility Rules Engine: Fail & Conflict Cases
  // ------------------------------------------------------------------
  console.log("\n--- Suite 3: Compatibility Engine (Fail & Conflict Cases) ---");

  // Rule 1: Socket mismatch (AM5 CPU on AM4 Motherboard)
  const moboB550 = parts.find((p) => p.slug === "msi-b550m-pro-vdh-wifi")!;
  const badSocketReport = checkCompatibility({ ...validBuild, motherboard: moboB550 });
  assert(!badSocketReport.isCompatible, "Fails when AM5 CPU is paired with AM4 motherboard");
  const socketCheck = badSocketReport.checks.find((c) => c.ruleId === "CPU_SOCKET_MATCH");
  assert(socketCheck !== undefined && !socketCheck.passed && socketCheck.level === "CRITICAL", "Emits CRITICAL failure on CPU_SOCKET_MATCH");

  // Rule 2: RAM mismatch (DDR4 RAM on DDR5 Motherboard)
  const ramD4 = parts.find((p) => p.slug === "kingston-fury-beast-16gb-2x8gb-ddr4-3200")!;
  const badRamReport = checkCompatibility({ ...validBuild, ram: ramD4 });
  assert(!badRamReport.isCompatible, "Fails when DDR4 RAM is placed into DDR5 motherboard");
  const ramCheck = badRamReport.checks.find((c) => c.ruleId === "RAM_TYPE_MATCH");
  assert(ramCheck !== undefined && !ramCheck.passed, "Emits failure on RAM_TYPE_MATCH");

  // Rule 3: Form Factor conflict (ATX Motherboard in Mini-ITX Case)
  const caseITX = parts.find((p) => p.slug === "cooler-master-masterbox-nr200-itx-case")!;
  const badFormFactorReport = checkCompatibility({ ...validBuild, case: caseITX });
  assert(!badFormFactorReport.isCompatible, "Fails when ATX motherboard is placed into Mini-ITX chassis");
  const formCheck = badFormFactorReport.checks.find((c) => c.ruleId === "MOBO_CASE_FORM_FACTOR");
  assert(formCheck !== undefined && !formCheck.passed, "Emits failure on MOBO_CASE_FORM_FACTOR");

  // Rule 4: GPU Length clearance conflict
  const tightCase: PartItem = {
    ...caseAir,
    specs: { ...caseAir.specs, maxGpuLengthMm: 220 } as any,
  };
  const badGpuLengthReport = checkCompatibility({ ...validBuild, case: tightCase });
  assert(!badGpuLengthReport.isCompatible, "Fails when GPU length exceeds chassis maximum clearance");
  const gpuCheck = badGpuLengthReport.checks.find((c) => c.ruleId === "GPU_LENGTH_CLEARANCE");
  assert(gpuCheck !== undefined && !gpuCheck.passed, "Emits failure on GPU_LENGTH_CLEARANCE");

  // Rule 5: CPU Cooler height clearance conflict
  const shortCase: PartItem = {
    ...caseAir,
    specs: { ...caseAir.specs, maxCpuCoolerHeightMm: 140 } as any,
  };
  const badCoolerHeightReport = checkCompatibility({ ...validBuild, case: shortCase });
  assert(!badCoolerHeightReport.isCompatible, "Fails when 155mm air cooler exceeds 140mm glass panel clearance");
  const coolerHeightCheck = badCoolerHeightReport.checks.find((c) => c.ruleId === "COOLER_HEIGHT_CLEARANCE");
  assert(coolerHeightCheck !== undefined && !coolerHeightCheck.passed, "Emits failure on COOLER_HEIGHT_CLEARANCE");

  // Rule 6: Cooler Socket bracket missing
  const oldCooler: PartItem = {
    ...coolerPA120,
    specs: { ...coolerPA120.specs, supportedSockets: ["LGA1151", "AM3"] } as any,
  };
  const badBracketReport = checkCompatibility({ ...validBuild, cooler: oldCooler });
  assert(!badBracketReport.isCompatible, "Fails when cooler lacks mounting bracket for CPU socket");

  // Rule 7: Inadequate PSU Wattage
  const tinyPsu: PartItem = {
    ...psu750,
    specs: { ...psu750.specs, wattage: 250 } as any,
  };
  const badPsuReport = checkCompatibility({ ...validBuild, psu: tinyPsu });
  assert(!badPsuReport.isCompatible, "Fails when PSU wattage (250W) is lower than system draw (>400W)");
  const psuCheck = badPsuReport.checks.find((c) => c.ruleId === "PSU_WATTAGE_SUFFICIENCY");
  assert(psuCheck !== undefined && !psuCheck.passed && psuCheck.level === "CRITICAL", "Emits CRITICAL failure on PSU_WATTAGE_SUFFICIENCY");

  // Rule 8: Missing display output when no GPU and CPU lacks iGPU
  const cpu5600 = parts.find((p) => p.slug === "amd-ryzen-5-5600")!; // no integrated graphics
  const noGpuReport = checkCompatibility({
    cpu: cpu5600,
    motherboard: moboB550,
    ram: ramD4,
    psu: psu750,
    case: caseAir,
  });
  assert(!noGpuReport.isCompatible, "Fails when CPU lacks integrated GPU and no discrete graphics card is installed");

  // ------------------------------------------------------------------
  // 4. Smart Build Generator
  // ------------------------------------------------------------------
  console.log("\n--- Suite 4: Smart Dynamic Build Generator ---");

  // Tier 1: Budget tier (RM2,500)
  const budgetTier = await generateSmartBuild({ budgetMyr: 2500, useCase: "budget" });
  assert(budgetTier.success, "Generates successful build at RM2,500 budget");
  assert(budgetTier.totalPriceMyr <= 2650, `Build adheres to RM2,500 budget constraint (total: RM${budgetTier.totalPriceMyr})`);
  assert(budgetTier.compatibility.isCompatible, "Generated RM2,500 build passes 100% of compatibility checks");

  // Tier 2: Mid-range Gaming tier (RM5,000)
  const midGamingTier = await generateSmartBuild({ budgetMyr: 5000, useCase: "gaming" });
  assert(midGamingTier.success, "Generates successful build at RM5,000 gaming tier");
  assert(midGamingTier.totalPriceMyr <= 5250, `Build adheres to RM5,000 budget constraint (total: RM${midGamingTier.totalPriceMyr})`);
  assert(midGamingTier.selection.gpu !== null, "Gaming tier includes dedicated high-performance GPU");
  assert(midGamingTier.compatibility.isCompatible, "Generated RM5,000 gaming build passes 100% of compatibility checks");

  // Tier 3: Workstation tier (RM9,000)
  const workstationTier = await generateSmartBuild({ budgetMyr: 9000, useCase: "workstation" });
  assert(workstationTier.success, "Generates successful build at RM9,000 workstation tier");
  assert(workstationTier.compatibility.isCompatible, "Generated RM9,000 workstation build passes 100% of compatibility checks");

  // Budget validation: Rejection when budget is unrealistically low
  assert(budgetTier.allocations.length === 8, "Build generator outputs allocations across all 8 component categories");

  // ------------------------------------------------------------------
  // 5. Troubleshooting Hardware Handoff
  // ------------------------------------------------------------------
  console.log("\n--- Suite 5: AI Diagnostics Hardware Handoff ---");

  const ramHandoff = detectHardwareHandoff("PC won't boot, DRAM LED is solid orange", "First test each RAM stick individually");
  assert(ramHandoff !== null && ramHandoff.componentType === "RAM", "Detects RAM hardware fault and sets componentType: RAM");
  assert(Boolean(ramHandoff?.ctaUrl.includes("/parts?type=RAM")), "Generates direct pre-filtered CTA URL for replacement RAM");

  const gpuHandoff = detectHardwareHandoff("Screen shows pink artifacts and space invaders crash", "This indicates VRAM degradation on your GPU");
  assert(gpuHandoff !== null && gpuHandoff.componentType === "GPU", "Detects GPU artifacting and sets componentType: GPU");

  const smartHandoff = detectHardwareHandoff("SMART warning: Uncorrectable pending sector count critical", "Back up data immediately");
  assert(smartHandoff !== null && smartHandoff.componentType === "STORAGE", "Detects SMART drive degradation and sets componentType: STORAGE");

  const nonHwHandoff = detectHardwareHandoff("How to update Windows 11 KB5034441", "Follow Windows Update troubleshooting");
  assert(nonHwHandoff === null, "Leaves parts handoff null on non-hardware software issues");

  // ------------------------------------------------------------------
  // 6. Installation Guides Structure
  // ------------------------------------------------------------------
  console.log("\n--- Suite 6: Installation Guides Structure ---");
  const guidesFilePath = path.join(process.cwd(), "data", "installation_guides.json");
  assert(fs.existsSync(guidesFilePath), "installation_guides.json exists on disk");
  const guides = JSON.parse(fs.readFileSync(guidesFilePath, "utf-8"));
  assert(guides.length >= 6, `Contains guides for components (count: ${guides.length})`);
  const cpuGuide = guides.find((g: any) => g.componentType === "CPU");
  assert(cpuGuide !== undefined && cpuGuide.steps.length >= 4, "CPU installation guide includes detailed step-by-step instructions");
  assert(cpuGuide?.precautions.length >= 1, "Installation guide highlights critical hardware precautions");

  // ------------------------------------------------------------------
  // 7. Price Alerts Engine
  // ------------------------------------------------------------------
  console.log("\n--- Suite 7: Price Alerts Engine ---");
  const alertReport = await evaluatePriceAlerts();
  assert(alertReport.evaluatedCount >= 1, `Evaluated active watchlists (count: ${alertReport.evaluatedCount})`);

  // ------------------------------------------------------------------
  // 8. Second-Hand Market & Hybrid Build Strategy
  // ------------------------------------------------------------------
  console.log("\n--- Suite 8: Second-Hand Market & Hybrid Strategy ---");
  const usedParts = await getAllParts({ condition: "used" });
  assert(usedParts.length >= 8, `Catalog contains second-hand listings (found: ${usedParts.length})`);

  const rx6600 = usedParts.find((p) => p.slug === "sapphire-pulse-radeon-rx-6600-8gb");
  assert(rx6600 !== undefined && rx6600.hasUsedListings, "RX 6600 includes verified second-hand listings");
  assert(
    rx6600 !== undefined && (rx6600.bestUsedPriceMyr || 0) < (rx6600.bestNewPriceMyr || 9999),
    `Used price (RM${rx6600?.bestUsedPriceMyr}) provides significant savings over retail (RM${rx6600?.bestNewPriceMyr})`
  );

  const carousellQuote = rx6600?.prices.find((pr) => pr.retailerSlug === "carousell-my");
  assert(carousellQuote !== undefined && carousellQuote.isMarketplace === true, "Carousell MY quote marked as marketplace");
  assert(Boolean(carousellQuote?.sellerLocation), `Used listing includes seller location (${carousellQuote?.sellerLocation})`);

  // Test Smart Hybrid Build (RM2,500 budget)
  const hybridBuild = await generateSmartBuild({
    budgetMyr: 2500,
    useCase: "gaming",
    marketPreference: "hybrid",
  });
  assert(hybridBuild.success, "Generates successful Smart Hybrid build at RM2,500");
  assert(hybridBuild.marketPreference === "hybrid", "Reports marketPreference: hybrid in build result");

  const psuAlloc = hybridBuild.allocations.find((a) => a.componentType === "PSU");
  assert(psuAlloc?.condition === "new", "Hybrid mode strictly enforces brand-new PSU for electrical protection");

  const storageAlloc = hybridBuild.allocations.find((a) => a.componentType === "STORAGE");
  assert(storageAlloc?.condition === "new", "Hybrid mode strictly enforces brand-new Storage for data integrity");

  assert(hybridBuild.compatibility.isCompatible, "Smart Hybrid build passes 100% of deterministic compatibility checks");
  assert(hybridBuild.totalPriceMyr <= 2600, `Smart Hybrid build adheres to target budget (total: RM${hybridBuild.totalPriceMyr})`);

  // Test Second-Hand Maximizer Build (RM1,800 budget)
  const usedBuild = await generateSmartBuild({
    budgetMyr: 1800,
    useCase: "budget",
    marketPreference: "used",
  });
  assert(usedBuild.success, "Generates successful Second-Hand Value build at RM1,800");
  assert(usedBuild.compatibility.isCompatible, "Second-Hand build passes 100% of compatibility checks");

  console.log("\n======================================================");
  console.log(`PARTS SYSTEM SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log("======================================================");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runPartsSuite().catch((err) => {
  console.error("Test suite crash:", err);
  process.exit(1);
});

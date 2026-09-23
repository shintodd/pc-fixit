import { BuildSelection, CpuSpecs, GpuSpecs, MotherboardSpecs, RamSpecs, StorageSpecs, PsuSpecs, CaseSpecs, CoolerSpecs } from "@/lib/parts/types";
import { CompatibilityReport, CompatibilityIssue } from "@/lib/parts/compatibility/types";

export function checkCompatibility(build: BuildSelection): CompatibilityReport {
  const checks: CompatibilityIssue[] = [];

  const cpu = build.cpu;
  const gpu = build.gpu;
  const mobo = build.motherboard;
  const ram = build.ram;
  const storage = build.storage;
  const psu = build.psu;
  const pcCase = build.case;
  const cooler = build.cooler;

  const cpuSpecs = cpu?.specs as CpuSpecs | undefined;
  const gpuSpecs = gpu?.specs as GpuSpecs | undefined;
  const moboSpecs = mobo?.specs as MotherboardSpecs | undefined;
  const ramSpecs = ram?.specs as RamSpecs | undefined;
  const storageSpecs = storage?.specs as StorageSpecs | undefined;
  const psuSpecs = psu?.specs as PsuSpecs | undefined;
  const caseSpecs = pcCase?.specs as CaseSpecs | undefined;
  const coolerSpecs = cooler?.specs as CoolerSpecs | undefined;

  // 1. CPU Socket vs Motherboard Socket
  if (cpuSpecs && moboSpecs) {
    const isSocketMatch = cpuSpecs.socket.toUpperCase() === moboSpecs.socket.toUpperCase();
    checks.push({
      ruleId: "CPU_SOCKET_MATCH",
      category: "SOCKET",
      level: isSocketMatch ? "INFO" : "CRITICAL",
      passed: isSocketMatch,
      componentA: cpu?.name,
      componentB: mobo?.name,
      messageEn: isSocketMatch
        ? `CPU socket (${cpuSpecs.socket}) matches motherboard socket (${moboSpecs.socket}).`
        : `Incompatible socket: ${cpu?.name} (${cpuSpecs.socket}) cannot fit into ${mobo?.name} (${moboSpecs.socket}).`,
      messageMs: isSocketMatch
        ? `Soket CPU (${cpuSpecs.socket}) sepadan dengan soket motherboard (${moboSpecs.socket}).`
        : `Soket tidak serasi: ${cpu?.name} (${cpuSpecs.socket}) tidak boleh dipasang pada ${mobo?.name} (${moboSpecs.socket}).`,
    });
  }

  // 2. RAM Type vs Motherboard Support (DDR4 vs DDR5)
  if (ramSpecs && moboSpecs) {
    const isRamMatch = ramSpecs.ramType.toUpperCase() === moboSpecs.ramType.toUpperCase();
    checks.push({
      ruleId: "RAM_TYPE_MATCH",
      category: "RAM",
      level: isRamMatch ? "INFO" : "CRITICAL",
      passed: isRamMatch,
      componentA: ram?.name,
      componentB: mobo?.name,
      messageEn: isRamMatch
        ? `RAM generation (${ramSpecs.ramType}) matches motherboard memory slots (${moboSpecs.ramType}).`
        : `Memory mismatch: ${ram?.name} is ${ramSpecs.ramType}, but ${mobo?.name} only accepts ${moboSpecs.ramType}. Physical notch positions differ.`,
      messageMs: isRamMatch
        ? `Generasi RAM (${ramSpecs.ramType}) sepadan dengan slot motherboard (${moboSpecs.ramType}).`
        : `RAM tidak serasi: ${ram?.name} ialah ${ramSpecs.ramType}, tetapi ${mobo?.name} hanya menyokong ${moboSpecs.ramType}.`,
    });
  }

  // 3. Motherboard Form Factor vs Case Support
  if (moboSpecs && caseSpecs) {
    const isMoboCaseMatch = caseSpecs.formFactorSupport.some(
      (ff) => ff.toLowerCase() === moboSpecs.formFactor.toLowerCase()
    );
    checks.push({
      ruleId: "MOBO_CASE_FORM_FACTOR",
      category: "FORM_FACTOR",
      level: isMoboCaseMatch ? "INFO" : "CRITICAL",
      passed: isMoboCaseMatch,
      componentA: mobo?.name,
      componentB: pcCase?.name,
      messageEn: isMoboCaseMatch
        ? `Motherboard form factor (${moboSpecs.formFactor}) fits within case form factor support.`
        : `Form factor conflict: ${mobo?.name} (${moboSpecs.formFactor}) is too large for ${pcCase?.name} (supports: ${caseSpecs.formFactorSupport.join(", ")}).`,
      messageMs: isMoboCaseMatch
        ? `Saiz motherboard (${moboSpecs.formFactor}) disokong oleh casing.`
        : `Konflik saiz: ${mobo?.name} (${moboSpecs.formFactor}) terlalu besar untuk ${pcCase?.name} (hanya menyokong: ${caseSpecs.formFactorSupport.join(", ")}).`,
    });
  }

  // 4. GPU Length vs Case Clearance
  if (gpuSpecs && caseSpecs) {
    const clearance = caseSpecs.maxGpuLengthMm - gpuSpecs.lengthMm;
    const isFit = clearance >= 0;
    const isTight = isFit && clearance < 15;

    checks.push({
      ruleId: "GPU_LENGTH_CLEARANCE",
      category: "DIMENSIONS",
      level: !isFit ? "CRITICAL" : isTight ? "WARN" : "INFO",
      passed: isFit,
      componentA: gpu?.name,
      componentB: pcCase?.name,
      messageEn: !isFit
        ? `GPU clearance conflict: ${gpu?.name} is ${gpuSpecs.lengthMm}mm long, exceeding case maximum clearance of ${caseSpecs.maxGpuLengthMm}mm.`
        : isTight
        ? `Tight GPU clearance: ${gpu?.name} (${gpuSpecs.lengthMm}mm) has only ${clearance}mm buffer before front case fans.`
        : `GPU clearance verified (${gpuSpecs.lengthMm}mm fits inside ${caseSpecs.maxGpuLengthMm}mm case limit).`,
      messageMs: !isFit
        ? `Panjang GPU melebihi had: ${gpu?.name} (${gpuSpecs.lengthMm}mm) melebihi ruang maksimum casing (${caseSpecs.maxGpuLengthMm}mm).`
        : isTight
        ? `Ruang GPU agak ketat: ${gpu?.name} hanya mempunyai baki ${clearance}mm.`
        : `Ukuran GPU disahkan muat dalam casing.`,
    });
  }

  // 5. CPU Cooler Height vs Case Clearance
  if (coolerSpecs && caseSpecs) {
    if (coolerSpecs.coolerType === "Air") {
      const isHeightFit = coolerSpecs.heightMm <= caseSpecs.maxCpuCoolerHeightMm;
      checks.push({
        ruleId: "COOLER_HEIGHT_CLEARANCE",
        category: "DIMENSIONS",
        level: isHeightFit ? "INFO" : "CRITICAL",
        passed: isHeightFit,
        componentA: cooler?.name,
        componentB: pcCase?.name,
        messageEn: isHeightFit
          ? `Air cooler height (${coolerSpecs.heightMm}mm) fits under case glass panel (${caseSpecs.maxCpuCoolerHeightMm}mm max).`
          : `Cooler height conflict: ${cooler?.name} (${coolerSpecs.heightMm}mm) exceeds case glass panel clearance (${caseSpecs.maxCpuCoolerHeightMm}mm).`,
        messageMs: isHeightFit
          ? `Ketinggian cooler (${coolerSpecs.heightMm}mm) muat di bawah panel kaca casing.`
          : `Cooler terlalu tinggi: ${cooler?.name} (${coolerSpecs.heightMm}mm) melebihi had panel casing (${caseSpecs.maxCpuCoolerHeightMm}mm).`,
      });
    }
  }

  // 6. CPU Cooler Socket Mounting Bracket
  if (coolerSpecs && cpuSpecs) {
    const hasMountingBracket = coolerSpecs.supportedSockets.some(
      (s) => s.toUpperCase() === cpuSpecs.socket.toUpperCase()
    );
    checks.push({
      ruleId: "COOLER_SOCKET_BRACKET",
      category: "COOLING",
      level: hasMountingBracket ? "INFO" : "CRITICAL",
      passed: hasMountingBracket,
      componentA: cooler?.name,
      componentB: cpu?.name,
      messageEn: hasMountingBracket
        ? `Cooler mounting brackets support ${cpuSpecs.socket} socket.`
        : `Mounting bracket missing: ${cooler?.name} does not list native bracket support for ${cpuSpecs.socket}.`,
      messageMs: hasMountingBracket
        ? `Braket pemasangan cooler menyokong soket ${cpuSpecs.socket}.`
        : `Braket tidak serasi: ${cooler?.name} tiada sokongan rasmi untuk soket ${cpuSpecs.socket}.`,
    });
  }

  // 7. Power Draw & PSU Wattage
  const cpuTdp = cpuSpecs?.tdpWattage || 65;
  const gpuTdp = gpuSpecs?.tdpWattage || 0;
  const moboBaseDraw = 50;
  const ramDraw = (ramSpecs?.moduleCount || 2) * 8;
  const storageDraw = 10;
  const coolingFansDraw = 20;

  const estimatedWattage = cpuTdp + gpuTdp + moboBaseDraw + ramDraw + storageDraw + coolingFansDraw;
  // Recommended PSU includes 33% headroom for transient excursions and optimal 50-70% efficiency curve
  const recommendedPsuWattage = Math.ceil((estimatedWattage * 1.33) / 50) * 50;

  if (psuSpecs) {
    const isPsuSufficient = psuSpecs.wattage >= estimatedWattage;
    const hasHeadroom = psuSpecs.wattage >= recommendedPsuWattage;

    checks.push({
      ruleId: "PSU_WATTAGE_SUFFICIENCY",
      category: "POWER",
      level: !isPsuSufficient ? "CRITICAL" : !hasHeadroom ? "WARN" : "INFO",
      passed: isPsuSufficient,
      componentA: psu?.name,
      messageEn: !isPsuSufficient
        ? `Inadequate Power: System draws approx ${estimatedWattage}W under load, exceeding ${psu?.name} (${psuSpecs.wattage}W). Risk of emergency shutdowns.`
        : !hasHeadroom
        ? `Tight PSU Headroom: ${psuSpecs.wattage}W covers base ${estimatedWattage}W draw, but recommended wattage is ${recommendedPsuWattage}W for GPU transient spikes.`
        : `PSU wattage verified (${psuSpecs.wattage}W covers estimated ${estimatedWattage}W load with recommended ${recommendedPsuWattage}W buffer).`,
      messageMs: !isPsuSufficient
        ? `Kuasa PSU tidak mencukupi: Anggaran penggunaan kuasa sistem (${estimatedWattage}W) melebihi kapasiti PSU (${psuSpecs.wattage}W).`
        : !hasHeadroom
        ? `Had kuasa agak ketat: ${psuSpecs.wattage}W mencukupi tetapi disyorkan sekurang-kurangnya ${recommendedPsuWattage}W.`
        : `Kapasiti bekalan kuasa disahkan mencukupi dengan margin selamat.`,
    });
  }

  // 8. GPU 12VHPWR vs PSU Native Cable
  if (gpuSpecs && psuSpecs) {
    if (gpuSpecs.has12Vhpwr && !psuSpecs.has12Vhpwr) {
      checks.push({
        ruleId: "GPU_12VHPWR_ADAPTER_NOTICE",
        category: "POWER",
        level: "WARN",
        passed: true,
        componentA: gpu?.name,
        componentB: psu?.name,
        messageEn: `${gpu?.name} uses a 12VHPWR (16-pin) connector. Your PSU does not feature native ATX 3.0 12VHPWR cable, requiring the included 2x/3x 8-pin adapter dongle.`,
        messageMs: `${gpu?.name} menggunakan kabel 12VHPWR (16-pin). PSU ini memerlukan penggunaan penyesuai kabel adapter 8-pin yang dibekalkan.`,
      });
    }
  }

  // 9. Storage M.2 Slot Count
  if (storageSpecs && moboSpecs) {
    if (storageSpecs.formFactor.includes("M.2") && moboSpecs.m2Slots < 1) {
      checks.push({
        ruleId: "STORAGE_M2_SLOT_CHECK",
        category: "STORAGE",
        level: "CRITICAL",
        passed: false,
        componentA: storage?.name,
        componentB: mobo?.name,
        messageEn: `Motherboard ${mobo?.name} lacks M.2 slots for ${storage?.name}.`,
        messageMs: `Motherboard ${mobo?.name} tiada slot M.2 untuk memasang ${storage?.name}.`,
      });
    }
  }

  // 10. Integrated Graphics Display Output Check
  if (!gpu && cpuSpecs && !cpuSpecs.integratedGpu) {
    checks.push({
      ruleId: "NO_DISPLAY_OUTPUT",
      category: "SOCKET",
      level: "CRITICAL",
      passed: false,
      componentA: cpu?.name,
      messageEn: `Missing display output: ${cpu?.name} lacks integrated graphics (iGPU) and no dedicated graphics card was selected. The PC cannot output to a monitor.`,
      messageMs: `Tiada paparan video: ${cpu?.name} tiada cip grafik terbina (iGPU) dan tiada kad grafik berasingan dipilih. Skrin tidak akan menyala.`,
    });
  }

  const hasCritical = checks.some((c) => c.level === "CRITICAL" && !c.passed);
  const hasWarning = checks.some((c) => c.level === "WARN");

  return {
    isCompatible: !hasCritical,
    status: hasCritical ? "FAIL" : hasWarning ? "WARN" : "PASS",
    estimatedWattage,
    recommendedPsuWattage,
    checks,
  };
}

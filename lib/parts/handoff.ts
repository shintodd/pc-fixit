import { ComponentType } from "@/lib/parts/types";

export interface PartsHandoff {
  detectedFault: string;
  componentType: ComponentType;
  filterParams: Record<string, string>;
  ctaUrl: string;
  actionLabelEn: string;
  actionLabelMs: string;
  reasonEn: string;
  reasonMs: string;
}

export function detectHardwareHandoff(query: string, replyText: string): PartsHandoff | null {
  const combined = `${query} ${replyText}`.toLowerCase();

  // 1. RAM / Memory Fault
  if (
    /\b(dram\s+led|ram\s+(?:fail|dead|corrupt|damaged|broken|error|fault)|bad\s+memory\s+stick|code\s+(?:55|45)|memory\s+parity)\b/i.test(
      combined
    )
  ) {
    const isDdr5 = /\bddr5\b/i.test(combined);
    const isDdr4 = /\bddr4\b/i.test(combined);
    const ramType = isDdr5 ? "DDR5" : isDdr4 ? "DDR4" : undefined;
    const filterParams: Record<string, string> = { type: "RAM" };
    if (ramType) filterParams.ramType = ramType;

    return {
      detectedFault: "MEMORY_HARDWARE_FAILURE",
      componentType: "RAM",
      filterParams,
      ctaUrl: `/parts?type=RAM${ramType ? `&ramType=${ramType}` : ""}`,
      actionLabelEn: "Browse Compatible Replacement RAM",
      actionLabelMs: "Lihat Pilihan RAM Gantian Yang Sesuai",
      reasonEn: "Diagnosis identified a potential RAM module failure. Check compatible memory kits for your system.",
      reasonMs: "Diagnosis mengenal pasti kemungkinan kerosakan modul RAM. Semak pilihan RAM yang serasi dengan PC anda.",
    };
  }

  // 2. GPU / Graphics Card Fault
  if (
    /\b(vga\s+led|gpu\s+(?:artifact|failing|dead|burnt|crash|timeout)|space\s*invaders|code\s+43|nvlddmkm|amdkmdag|video\s+memory\s+error)\b/i.test(
      combined
    )
  ) {
    return {
      detectedFault: "GPU_HARDWARE_FAILURE",
      componentType: "GPU",
      filterParams: { type: "GPU" },
      ctaUrl: "/parts?type=GPU",
      actionLabelEn: "Browse Compatible Graphics Cards",
      actionLabelMs: "Lihat Kad Grafik (GPU) Yang Serasi",
      reasonEn: "Hardware symptoms indicate GPU failure or VRAM degradation. View replacement graphics cards with live Malaysian pricing.",
      reasonMs: "Gejala perkakasan menunjukkan isu kad grafik atau kerosakan VRAM. Semak pilihan GPU dengan harga pasaran Malaysia.",
    };
  }

  // 3. Storage / SSD Bad Sectors
  if (
    /\b(smart\s+(?:bad|error|failure|warning)|drive\s+(?:failing|dead|corrupted)|pending\s+sector|dirty\s+bit|write\s+protect(?:ed)?|nvme\s+not\s+detected)\b/i.test(
      combined
    )
  ) {
    return {
      detectedFault: "STORAGE_HARDWARE_FAILURE",
      componentType: "STORAGE",
      filterParams: { type: "STORAGE" },
      ctaUrl: "/parts?type=STORAGE",
      actionLabelEn: "Find Fast Replacement NVMe SSDs",
      actionLabelMs: "Cari SSD NVMe Gantian Pantas",
      reasonEn: "SMART diagnostics indicate failing storage sectors. Backup data immediately and explore replacement M.2 SSDs.",
      reasonMs: "Diagnosis SMART menunjukkan sektor storan rosak. Buat salinan data segera dan lihat pilihan SSD NVMe gantian.",
    };
  }

  // 4. Thermal Overheating / Cooler Failure
  if (
    /\b(tjmax|prochot|thermal\s+throttle|pump\s+(?:dead|failure|stopped)|9[5-9]c|10[0-5]c|cpu\s+overheat(?:ing)?|cooler\s+failure)\b/i.test(
      combined
    )
  ) {
    return {
      detectedFault: "COOLING_THERMAL_FAILURE",
      componentType: "COOLER",
      filterParams: { type: "COOLER" },
      ctaUrl: "/parts?type=COOLER",
      actionLabelEn: "Upgrade CPU Air & Liquid Coolers",
      actionLabelMs: "Tingkatkan Sistem Penyejuk (Cooler) CPU",
      reasonEn: "Sustained extreme temperatures detected. Inspect thermal paste and explore high-performance cooling upgrades.",
      reasonMs: "Suhu ekstrem dikesan melebihi paras selamat. Pertimbangkan penyejuk CPU yang lebih berkuasa.",
    };
  }

  // 5. Power Supply (PSU) Trip
  if (
    /\b(power\s+trip|shutdown\s+under\s+load|psu\s+(?:failing|dead|smell|click)|transient\s+excursion|ocp\s+trip|opp\s+trip)\b/i.test(
      combined
    )
  ) {
    return {
      detectedFault: "PSU_POWER_FAILURE",
      componentType: "PSU",
      filterParams: { type: "PSU" },
      ctaUrl: "/parts?type=PSU",
      actionLabelEn: "Explore Certified Power Supplies (PSUs)",
      actionLabelMs: "Lihat Bekalan Kuasa (PSU) Berkualiti",
      reasonEn: "Power cutouts under graphical or computing load suggest insufficient or failing power supply.",
      reasonMs: "PC terpadam semasa bebanan tinggi menandakan bekalan kuasa tidak mencukupi atau mula rosak.",
    };
  }

  return null;
}

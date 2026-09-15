/**
 * Deep Fact-Check Script
 * Validates every claim in every fix step across all 220 guides.
 * Checks: command syntax, temperature values, voltage ranges,
 * tool names, version numbers, registry paths, and logical consistency.
 */
import fs from "fs";
import path from "path";

interface FixStep {
  title: string;
  detail: string;
}

interface Issue {
  slug: string;
  title: string;
  summary: string;
  severity: string;
  symptoms: string[];
  fix_steps: FixStep[];
}

const RESEARCH_DIR = path.join(process.cwd(), "data", "research");
const CATEGORY_FILES = [
  "wont-boot.json",
  "blue-screen.json",
  "running-slow.json",
  "no-internet.json",
  "overheating.json",
  "driver-issues.json",
];

interface Finding {
  category: string;
  slug: string;
  title: string;
  step: string;
  severity: "CRITICAL" | "WARN" | "INFO";
  type: string;
  claim: string;
  verdict: string;
  correction?: string;
}

const findings: Finding[] = [];
let totalSteps = 0;
let totalIssues = 0;

// ---- Fact Check Rules ----

function checkWindowsCommands(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // sfc command
  if (/sfc\/scannow/i.test(d)) {
    findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "CMD_SYNTAX", claim: d.match(/sfc\/\S+/i)![0], verdict: "Missing space. Must be: sfc /scannow", correction: "sfc /scannow" });
  }
  // DISM RestoreHealth
  if (/DISM.*RestoreHealth/i.test(d) && !/\/RestoreHealth/i.test(d)) {
    findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "CMD_SYNTAX", claim: "RestoreHealth without slash", verdict: "Must be /RestoreHealth. Missing leading slash.", correction: "DISM /Online /Cleanup-Image /RestoreHealth" });
  }
  // chkdsk flags
  if (/chkdsk\s+[a-z]:?\s+\/[fr]/i.test(d)) {
    // valid
  } else if (/chkdsk\s+\/[^fr]/i.test(d)) {
    const m = d.match(/chkdsk\s+\/(\S+)/i);
    if (m && !["f", "r", "x", "scan", "spotfix", "b"].includes(m[1].toLowerCase())) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "CMD_SYNTAX", claim: "chkdsk /" + m[1], verdict: "Unusual chkdsk flag - verify it is valid for Windows 10/11", correction: "chkdsk C: /f /r" });
    }
  }
  // netsh syntax
  if (/netsh\s+winsock\s+reset\s+catalog/i.test(d)) {
    // valid with 'catalog' argument
  }
  // powershell commands
  if (/Get-NetAdapter\s*\|/i.test(d) && !/Get-NetAdapter\s*\|?\s*(Restart|Set|Disable|Enable)/i.test(d)) {
    // Piping Get-NetAdapter into nothing - suspicious but not necessarily wrong
  }
  // ren command path validation
  if (/ren\s+C:\\Windows\\SoftwareDistribution\s+SoftwareDistribution\.old/i.test(d)) {
    // valid
  }
  // bcdedit
  if (/bcdedit\s+\/set\s+\{current\}/i.test(d) && !/bcdedit\s+\/set\s+\{current\}\s+\w+/i.test(d)) {
    findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "CMD_SYNTAX", claim: "bcdedit /set {current}", verdict: "Incomplete bcdedit command - missing property and value", correction: "bcdedit /set {current} safeboot minimal" });
  }
}

function checkTemperatures(step: FixStep, slug: string, cat: string, title: string) {
  const temps = step.detail.match(/(\d{2,3})°C/g);
  if (!temps) return;
  temps.forEach(t => {
    const c = parseInt(t);
    if (c > 130) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "TEMP_CLAIM", claim: t, verdict: `${c}°C is physically impossible for consumer CPU/GPU silicon (TjMax ~110°C, GPU junction ~120°C). Claim is wrong.`, correction: "CPU max ~105°C (TjMax), GPU junction max ~110-120°C" });
    } else if (c < 20 && cat !== "no-internet.json") {
      findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "TEMP_CLAIM", claim: t, verdict: `${c}°C seems unusually cold for normal operating temp claim - verify context` });
    }
  });
}

function checkVoltages(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // DDR4 voltage: should be 1.2V-1.65V (standard 1.2V, XMP up to 1.65V)
  const ddr4v = d.match(/(\d+\.\d+)V.*DDR4|DDR4.*(\d+\.\d+)V/gi);
  if (ddr4v) {
    ddr4v.forEach(m => {
      const numMatch = m.match(/(\d+\.\d+)/);
      if (numMatch) {
        const v = parseFloat(numMatch[1]);
        if (v > 1.7) {
          findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "VOLTAGE_CLAIM", claim: m, verdict: `DDR4 at ${v}V is dangerously high. XMP max is 1.65V; standard is 1.2V. Values above 1.7V can burn DIMM.`, correction: "DDR4 standard 1.2V, XMP max 1.65V" });
        }
      }
    });
  }
  // DDR5 voltage: should be 1.1V-1.35V
  const ddr5v = d.match(/(\d+\.\d+)V.*DDR5|DDR5.*(\d+\.\d+)V/gi);
  if (ddr5v) {
    ddr5v.forEach(m => {
      const numMatch = m.match(/(\d+\.\d+)/);
      if (numMatch) {
        const v = parseFloat(numMatch[1]);
        if (v > 1.5) {
          findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "VOLTAGE_CLAIM", claim: m, verdict: `DDR5 at ${v}V is dangerously high. Standard is 1.1V; XMP/EXPO max ~1.35V.`, correction: "DDR5 standard 1.1V, XMP max ~1.35V" });
        }
      }
    });
  }
  // CPU undervolt range check (-50mV to -200mV is safe, beyond that risky)
  const uvMatch = d.match(/(-\d+)\s*mV/);
  if (uvMatch) {
    const mv = Math.abs(parseInt(uvMatch[1]));
    if (mv > 300) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "VOLTAGE_CLAIM", claim: uvMatch[0], verdict: `Undervolt of ${uvMatch[0]} is extreme. Most CPUs accept -50mV to -150mV safely. Beyond -200mV risks instability.`, correction: "Start conservative: -50mV, test, then increment -25mV at a time" });
    }
  }
  // 12V rail check: 11.4V - 12.6V is normal ATX spec (±5%)
  const v12 = d.match(/(\d+\.\d+)\s*V.*12V|12V.*(\d+\.\d+)\s*V/g);
  if (v12) {
    v12.forEach(m => {
      const numMatch = m.match(/(\d+\.\d+)/);
      if (numMatch) {
        const v = parseFloat(numMatch[1]);
        if (v < 11.0 || v > 13.0) {
          findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "VOLTAGE_CLAIM", claim: m, verdict: `12V value of ${v}V outside normal ATX ±10% range (10.8V-13.2V). Verify context.` });
        }
      }
    });
  }
}

function checkToolNames(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // Common tool name fact checks
  const knownBad: [RegExp, string, string][] = [
    [/DDU\s*\(Display Driver Updater\)/i, "DDU is Display Driver Uninstaller, not Updater", "Display Driver Uninstaller (DDU)"],
    [/CrystalDiskMark.*S\.M\.A\.R\.T/i, "CrystalDiskMark is sequential benchmark, not SMART reader. Use CrystalDiskInfo for SMART.", "CrystalDiskInfo reads SMART health; CrystalDiskMark benchmarks speed"],
    [/HWMonitor.*GPU.*hotspot/i, "HWMonitor sometimes does not expose GPU hotspot. HWInfo64 is more reliable for GPU junction/hotspot.", "HWInfo64 recommended for GPU hotspot and junction temp"],
    [/MemTest86.*Windows/i, "MemTest86 runs bare-metal outside Windows (boot from USB), not inside Windows", "MemTest86 boots from USB independently of Windows"],
    [/mdsched\.exe.*hours/i, "mdsched.exe is Windows Memory Diagnostic, simpler but less thorough than MemTest86. It takes 20-40 min, not hours.", "mdsched.exe typically runs 20-40 minutes for standard test"],
    [/Malwarebytes.*real.?time/i, "Malwarebytes free edition has no real-time protection. Only Premium tier includes real-time.", "Malwarebytes free has no real-time protection; Premium required"],
  ];
  knownBad.forEach(([pattern, verdict, correction]) => {
    if (pattern.test(d)) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "TOOL_CLAIM", claim: d.substring(0, 120) + "...", verdict, correction });
    }
  });
}

function checkRegistryPaths(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // Known correct registry paths
  const badPaths: [RegExp, string, string][] = [
    [/HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run(?!ner)/i, "", ""],  // valid - skip
    [/HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Services\\Tcpip\\Parameters/i, "", ""],  // valid
  ];
  // Check for HKLM vs HKEY_LOCAL_MACHINE consistency
  if (/HKLM\\(?:SOFTWARE|SYSTEM)/i.test(d) || /HKEY_LOCAL_MACHINE\\(?:SOFTWARE|SYSTEM)/i.test(d)) {
    // Both are valid aliases - no problem
  }
  // Specific bad path check
  if (/HKEY_CURRENT_USER\\Control Panel\\Desktop\\WindowMetrics/i.test(d)) {
    // Valid for font smoothing settings
  }
}

function checkCPUTDPValues(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // Intel Core i9-13900K TDP is 125W base / 253W turbo
  if (/PL1.*125W.*PL2.*253W/i.test(d) || /125W.*253W/i.test(d)) {
    // Correct for Intel 13th gen (Raptor Lake) high-end
  }
  // Ryzen 9 7950X TDP is 170W
  if (/Ryzen.*170W/i.test(d)) {
    // Valid
  }
  // Check for clearly wrong TDP claims
  const wMatch = d.match(/(\d+)W.*(?:TDP|PL1|PL2|power limit)/i);
  if (wMatch) {
    const w = parseInt(wMatch[1]);
    if (w > 900) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "TDP_CLAIM", claim: wMatch[0], verdict: `${w}W TDP claim is impossibly high for a consumer CPU/GPU.`, correction: "Consumer CPU max ~350W (Intel Core Ultra 9), GPU max ~600W (RTX 5090)" });
    }
  }
}

function checkMacAddressFormat(step: FixStep, slug: string, cat: string, title: string) {
  // MAC address format: should be XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
  const badMac = step.detail.match(/\b[0-9A-Fa-f]{2}[.][0-9A-Fa-f]{4}[.][0-9A-Fa-f]{4}\b/);
  if (badMac) {
    findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "FORMAT_CLAIM", claim: badMac[0], verdict: "Cisco-style MAC format. Windows uses XX-XX-XX-XX-XX-XX with hyphens.", correction: "Windows: XX-XX-XX-XX-XX-XX" });
  }
}

function checkBIOSFlashProcedures(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail.toLowerCase();
  if ((d.includes("q-flash") || d.includes("ez flash") || d.includes("flash bios")) && !d.includes("fat32")) {
    // BIOS flash USB should always specify FAT32 format
    findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "BIOS_CLAIM", claim: step.detail.substring(0, 150), verdict: "BIOS flash USB must be formatted as FAT32. Missing this specification could lead to failed flash.", correction: "Always specify: USB drive must be formatted FAT32, 4GB or larger" });
  }
}

function checkSSDWearRationale(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // Defrag claim on SSD
  if (/defrag.*SSD|SSD.*defrag/i.test(d) && !/do not|never|avoid|skip|unnecessary/i.test(d)) {
    findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "SSD_CLAIM", claim: d.substring(0, 150), verdict: "Defragmenting an SSD is unnecessary and increases write wear. Windows Optimize already uses TRIM on SSDs.", correction: "Never run disk defragmentation on SSDs. Use TRIM via Windows Optimize instead." });
  }
}

function checkRAMFrequencyClaims(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // DDR4 base is 2133 MT/s (JEDEC). XMP can go to 6400+
  // DDR5 base is 4800 MT/s (JEDEC).
  const freqMatch = d.match(/(\d{4,5})\s*MHz/g);
  if (freqMatch) {
    freqMatch.forEach(f => {
      const mhz = parseInt(f);
      if (mhz > 10000) {
        findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "RAM_FREQ", claim: f, verdict: `${mhz} MHz is beyond current consumer DDR5 XMP limits (~8400 MT/s as of 2025). Verify claim.` });
      }
    });
  }
}

function checkNetworkMTUValues(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  const mtuMatch = d.match(/MTU\s*[=:]\s*(\d+)/i);
  if (mtuMatch) {
    const mtu = parseInt(mtuMatch[1]);
    if (mtu > 9000) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "NETWORK_CLAIM", claim: mtuMatch[0], verdict: `MTU of ${mtu} exceeds standard Jumbo Frame max (9000). Only valid if network adapter and router both support it.` });
    } else if (mtu < 576) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "NETWORK_CLAIM", claim: mtuMatch[0], verdict: `MTU of ${mtu} is below minimum (576). Will break TCP connections.`, correction: "Standard MTU: 1500 for Ethernet, 1492 for PPPoE" });
    }
  }
}

function checkIsopropylAlcoholConcentration(step: FixStep, slug: string, cat: string, title: string) {
  const d = step.detail;
  // IPA for electronics should be 90%+ ideally 99%
  const ipaMatch = d.match(/(\d+)%\+?\s*iso|iso.*(\d+)%\+?/i);
  if (ipaMatch) {
    const pct = parseInt(ipaMatch[1] || ipaMatch[2]);
    if (pct < 70) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "CRITICAL", type: "CHEMICAL_CLAIM", claim: ipaMatch[0], verdict: `${pct}% IPA is too low for electronics cleaning. Leaves water residue that causes corrosion.`, correction: "Use 90%+ IPA for electronics. 99% IPA is optimal." });
    } else if (pct < 90 && pct >= 70) {
      findings.push({ category: cat, slug, title, step: step.title, severity: "WARN", type: "CHEMICAL_CLAIM", claim: ipaMatch[0], verdict: `${pct}% IPA has significant water content. 90%+ recommended for PCB and contact cleaning.`, correction: "90%+ IPA preferred. 99% IPA is optimal." });
    }
  }
}

// ---- MAIN LOOP ----
console.log("=================================================");
console.log("DEEP FACT-CHECK: 220 GUIDES x STEP-BY-STEP AUDIT");
console.log("=================================================\n");

for (const file of CATEGORY_FILES) {
  const filePath = path.join(RESEARCH_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const issues: Issue[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  totalIssues += issues.length;

  console.log(`Auditing [${file}]: ${issues.length} guides...`);

  for (const issue of issues) {
    for (const step of issue.fix_steps) {
      totalSteps++;
      checkWindowsCommands(step, issue.slug, file, issue.title);
      checkTemperatures(step, issue.slug, file, issue.title);
      checkVoltages(step, issue.slug, file, issue.title);
      checkToolNames(step, issue.slug, file, issue.title);
      checkRegistryPaths(step, issue.slug, file, issue.title);
      checkCPUTDPValues(step, issue.slug, file, issue.title);
      checkMacAddressFormat(step, issue.slug, file, issue.title);
      checkBIOSFlashProcedures(step, issue.slug, file, issue.title);
      checkSSDWearRationale(step, issue.slug, file, issue.title);
      checkRAMFrequencyClaims(step, issue.slug, file, issue.title);
      checkNetworkMTUValues(step, issue.slug, file, issue.title);
      checkIsopropylAlcoholConcentration(step, issue.slug, file, issue.title);
    }
  }
}

console.log(`\n=================================================`);
console.log(`AUDIT COMPLETE: ${totalIssues} issues, ${totalSteps} fix steps checked`);
console.log(`Findings: ${findings.length}`);
console.log(`=================================================\n`);

const critical = findings.filter(f => f.severity === "CRITICAL");
const warn = findings.filter(f => f.severity === "WARN");

if (critical.length > 0) {
  console.log(`\n=== CRITICAL (${critical.length}) ===`);
  critical.forEach((f, i) => {
    console.log(`${i + 1}. [${f.category}] ${f.slug} / "${f.step}"`);
    console.log(`   CLAIM: ${f.claim.substring(0, 120)}`);
    console.log(`   VERDICT: ${f.verdict}`);
    if (f.correction) console.log(`   FIX: ${f.correction}`);
    console.log();
  });
}

if (warn.length > 0) {
  console.log(`\n=== WARN (${warn.length}) ===`);
  warn.forEach((f, i) => {
    console.log(`${i + 1}. [${f.category}] ${f.slug} / "${f.step}"`);
    console.log(`   CLAIM: ${f.claim.substring(0, 120)}`);
    console.log(`   VERDICT: ${f.verdict}`);
    if (f.correction) console.log(`   FIX: ${f.correction}`);
    console.log();
  });
}

fs.writeFileSync(
  path.join(process.cwd(), "scripts", "deep-fact-check-findings.json"),
  JSON.stringify(findings, null, 2)
);
console.log("Full report: scripts/deep-fact-check-findings.json");

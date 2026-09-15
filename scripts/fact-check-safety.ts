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
  related_error_codes?: number[];
  category_slug?: string;
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
  type: "CRITICAL_SAFETY" | "HARDWARE_RISK" | "DATA_RISK" | "EM_DASH_VIOLATION";
  description: string;
  recommendation?: string;
}

const findings: Finding[] = [];

console.log("=================================================");
console.log("STARTING 1-BY-1 DETAILED FACT CHECK & SAFETY AUDIT");
console.log("=================================================");

let totalIssues = 0;

for (const file of CATEGORY_FILES) {
  const filePath = path.join(RESEARCH_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const issues: Issue[] = JSON.parse(content);
  totalIssues += issues.length;

  console.log(`\nAuditing [${file}]: ${issues.length} guides...`);

  for (const issue of issues) {
    const rawIssueJson = JSON.stringify(issue);

    // Negative constraint: Check for em dashes
    if (rawIssueJson.includes("\u2014")) {
      findings.push({
        category: file,
        slug: issue.slug,
        title: issue.title,
        type: "EM_DASH_VIOLATION",
        description: "Contains forbidden em dash character (\u2014).",
      });
    }

    const textCorpus = (
      issue.title +
      " " +
      issue.summary +
      " " +
      issue.symptoms.join(" ") +
      " " +
      issue.fix_steps.map((s) => s.title + " " + s.detail).join(" ")
    ).toLowerCase();

    // 1. Screwdriver bridging check
    if (textCorpus.includes("screwdriver") && (textCorpus.includes("bridge") || textCorpus.includes("short") || textCorpus.includes("jump"))) {
      if (textCorpus.includes("pwr_sw") || textCorpus.includes("power switch")) {
        if (!textCorpus.includes("rgb") && !textCorpus.includes("never touch 12v")) {
          findings.push({
            category: file,
            slug: issue.slug,
            title: issue.title,
            type: "CRITICAL_SAFETY",
            description: "Mentions PWR_SW bridging without explicit warning against touching 12V RGB headers.",
            recommendation: "Explicitly clarify that only the two PWR_SW pins must be bridged, never 12V RGB headers.",
          });
        }
      }
    }

    // 2. AM4 / AM5 CPU cooler removal
    if (textCorpus.includes("cooler") && (textCorpus.includes("thermal paste") || textCorpus.includes("cpu")) && (textCorpus.includes("remove") || textCorpus.includes("dismount") || textCorpus.includes("lift") || textCorpus.includes("peel sticker"))) {
      const mentionsTwist = textCorpus.includes("twist");
      if (!mentionsTwist && (textCorpus.includes("dismount") || textCorpus.includes("remove cooler") || textCorpus.includes("lift"))) {
        findings.push({
          category: file,
          slug: issue.slug,
          title: issue.title,
          type: "HARDWARE_RISK",
          description: "Mentions removing CPU cooler without instruction to twist to break thermal paste seal.",
          recommendation: "Advise twisting gently after warming up CPU to prevent ripping CPU out of the socket.",
        });
      }
    }

    // 3. Modular PSU cables
    if ((textCorpus.includes("pcie cable") || textCorpus.includes("modular")) && (textCorpus.includes("power supply") || textCorpus.includes("psu"))) {
      if (textCorpus.includes("modular power supply") || issue.slug.includes("pcie-cable") || issue.slug.includes("psu-transient")) {
        if (!textCorpus.includes("standardized") && !textCorpus.includes("pinout") && !textCorpus.includes("mixing cables")) {
          findings.push({
            category: file,
            slug: issue.slug,
            title: issue.title,
            type: "HARDWARE_RISK",
            description: "Advises connecting modular PSU cables without warning against mixing cables across brands/models.",
            recommendation: "Add critical safety warning regarding modular PSU cable incompatibility.",
          });
        }
      }
    }

    // 4. Physical hardware manipulation power isolation
    const touchesInternals = issue.fix_steps.some((step) => {
      const t = (step.title + " " + step.detail).toLowerCase();
      return (
        t.includes("reseat") ||
        t.includes("dimm") ||
        t.includes("slot a2") ||
        t.includes("slot b2") ||
        (t.includes("ram") && (t.includes("stick") || t.includes("slot"))) ||
        (t.includes("gpu") && (t.includes("slot") || t.includes("retention"))) ||
        t.includes("thermal paste") ||
        t.includes("cr2032") ||
        t.includes("clrtc") ||
        t.includes("standoff") ||
        t.includes("breadboard")
      );
    });

    if (touchesInternals) {
      const mentionsPowerOff =
        textCorpus.includes("unplug") ||
        textCorpus.includes("power down") ||
        textCorpus.includes("power off") ||
        textCorpus.includes("switch off") ||
        textCorpus.includes("discharge") ||
        textCorpus.includes("shut down");

      if (!mentionsPowerOff) {
        findings.push({
          category: file,
          slug: issue.slug,
          title: issue.title,
          type: "HARDWARE_RISK",
          description: "Advises physical hardware reseating or manipulation without explicit instruction to disconnect AC power first.",
          recommendation: "Add safety step: Power down, turn off PSU rocker switch, and unplug wall power cord before touching internal circuitry.",
        });
      }
    }

    // 5. BIOS update power safety
    const fixStepsCorpus = issue.fix_steps.map((s) => s.title + " " + s.detail).join(" ").toLowerCase();
    const touchesBiosFlash =
      fixStepsCorpus.includes("flash bios") ||
      fixStepsCorpus.includes("update bios") ||
      fixStepsCorpus.includes("bios update") ||
      fixStepsCorpus.includes("q-flash") ||
      fixStepsCorpus.includes("ez flash") ||
      fixStepsCorpus.includes("flashback") ||
      fixStepsCorpus.includes("bios revision") ||
      fixStepsCorpus.includes("motherboard bios firmware");

    if (touchesBiosFlash) {
      const mentionsInterruption =
        fixStepsCorpus.includes("interrupt") ||
        fixStepsCorpus.includes("shut off") ||
        fixStepsCorpus.includes("power loss") ||
        fixStepsCorpus.includes("power interruption") ||
        fixStepsCorpus.includes("do not turn off") ||
        fixStepsCorpus.includes("never turn off");

      if (!mentionsInterruption) {
        findings.push({
          category: file,
          slug: issue.slug,
          title: issue.title,
          type: "HARDWARE_RISK",
          description: "Covers BIOS flashing without explicit warning never to interrupt power or turn off the PC during the write cycle.",
          recommendation: "Add prominent warning: Do not interrupt power during BIOS flashing to avoid bricking motherboard.",
        });
      }
    }

    // 6. Data loss / disk formatting
    if (issue.slug.includes("efi") || issue.slug.includes("diskpart") || issue.slug.includes("partition")) {
      for (const step of issue.fix_steps) {
        const text = step.detail.toLowerCase();
        if (text.includes("format") || text.includes("clean")) {
          const mentionsDataLoss =
            text.includes("data safety") ||
            text.includes("erase") ||
            text.includes("data loss") ||
            text.includes("backup");

          if (!mentionsDataLoss) {
            findings.push({
              category: file,
              slug: issue.slug,
              title: issue.title,
              type: "DATA_RISK",
              description: "Covers disk management/formatting without clear data loss warning.",
              recommendation: "Ensure explicit warning that disk commands permanently erase partitions and data.",
            });
          }
        }
      }
    }
  }
}

console.log(`\nAudit completed across ${totalIssues} guides.`);
console.log(`Total safety findings/enhancement opportunities flagged: ${findings.length}`);

// Group by type
const byType: Record<string, Finding[]> = {};
for (const f of findings) {
  if (!byType[f.type]) byType[f.type] = [];
  byType[f.type].push(f);
}

for (const [type, items] of Object.entries(byType)) {
  console.log(`\n--- ${type} (${items.length}) ---`);
  items.slice(0, 10).forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.category}] ${item.slug}: ${item.description}`);
    if (item.recommendation) console.log(`   Fix: ${item.recommendation}`);
  });
  if (items.length > 10) {
    console.log(`   ... and ${items.length - 10} more.`);
  }
}

fs.writeFileSync(
  path.join(process.cwd(), "scripts", "fact-check-findings.json"),
  JSON.stringify(findings, null, 2)
);
console.log("\nFull report written to scripts/fact-check-findings.json");

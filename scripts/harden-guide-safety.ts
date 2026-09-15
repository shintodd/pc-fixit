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
  [key: string]: any;
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

function checkNoEmDash(str: string, context: string) {
  if (str.includes("\u2014")) {
    throw new Error(`CRITICAL: Em dash found in ${context}!`);
  }
}

const SAFETY_ISOLATION_STEP: FixStep = {
  title: "Safety power-off and discharge",
  detail: "Shut down the PC, turn off the power supply rocker switch (O), and unplug the AC power cord from the wall outlet. Press the front power button once while unplugged to discharge residual capacitor energy before touching any internal components.",
};

const HW_KEYWORDS = [
  "reseat",
  "dimm",
  "memory stick",
  "slot a2",
  "slot b2",
  "ram stick",
  "pcie slot",
  "pcie x16",
  "gpu sag",
  "cmos battery",
  "cr2032",
  "clrtc",
  "clrcmos",
  "jbat1",
  "thermal paste",
  "cooler",
  "heatsink",
  "dismount",
  "fan blades",
  "compressed air",
  "standoff",
  "breadboard",
  "m.2 heatsink",
  "nvme slot",
  "24-pin",
  "8-pin eps",
  "pcie power cable",
  "auxiliary power cable",
];

let totalModified = 0;
const changeLog: { file: string; slug: string; rule: string }[] = [];

for (const file of CATEGORY_FILES) {
  const filePath = path.join(RESEARCH_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, "utf-8");
  const issues: Issue[] = JSON.parse(content);
  let fileChanged = false;

  for (const issue of issues) {
    const originalJson = JSON.stringify(issue);

    // Rule 1: Screwdriver jumping / pin bridging
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      if (text.includes("screwdriver") && (text.includes("bridge") || text.includes("short") || text.includes("jump"))) {
        if (text.includes("pwr_sw") || text.includes("power switch")) {
          if (!step.detail.includes("RGB") && !step.detail.includes("never touch 12v")) {
            step.detail += " SAFETY: Bridge ONLY the two marked PWR_SW pins. Never touch 12V RGB headers, USB headers, or audio pins, as shorting voltage rails will permanently damage the motherboard.";
            changeLog.push({ file, slug: issue.slug, rule: "PWR_SW screwdriver safety" });
          }
        }
        if (text.includes("clrtc") || text.includes("clrcmos") || text.includes("jbat1")) {
          if (!step.detail.includes("unplug") && !step.detail.includes("power cord")) {
            step.detail = "Unplug the AC power cord first. " + step.detail;
            changeLog.push({ file, slug: issue.slug, rule: "Clear CMOS jumper unplug safety" });
          }
        }
      }
      if (text.includes("cr2032") && text.includes("screwdriver")) {
        if (!step.detail.includes("traces") && !step.detail.includes("plastic")) {
          step.detail = step.detail.replace(
            /use a flathead screwdriver or fingernail to pop battery out/gi,
            "use a non-conductive plastic pry tool or fingernail (or carefully with a flathead screwdriver without scratching motherboard traces) to release the battery retention clip"
          );
          changeLog.push({ file, slug: issue.slug, rule: "CMOS battery pry safety" });
        }
      }
    }

    // Rule 2: AM4 / CPU Cooler removal
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      if (text.includes("cooler") && (text.includes("lift") || text.includes("remove") || text.includes("dismount") || text.includes("unmount") || text.includes("heatsink"))) {
        if (text.includes("straight up") || (text.includes("lift") && !text.includes("twist"))) {
          step.detail = step.detail.replace(/lift cooler straight up/gi, "gently twist the cooler left and right to break the thermal paste seal before lifting");
          step.detail = step.detail.replace(/carefully lift the cooler block off/gi, "gently twist the cooler block slightly left and right to break thermal paste vacuum, then carefully lift it off");
          if (!step.detail.toLowerCase().includes("twist")) {
            step.detail += " SAFETY NOTE: If removing a CPU cooler (especially AMD AM4), warm up the CPU with a brief workload first, then twist the cooler gently left and right before lifting. Never yank straight up, as cold paste can suction the CPU out of the socket and bend pins.";
          }
          changeLog.push({ file, slug: issue.slug, rule: "AM4 cooler twist safety" });
        }
      }
    }

    // Rule 3: Compressed air / fan dusting
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      if ((text.includes("compressed air") || text.includes("dust")) && (text.includes("fan") || text.includes("radiator") || text.includes("fin"))) {
        if (!step.detail.includes("blade") && !step.detail.includes("spin") && (text.includes("compressed air") || text.includes("blow"))) {
          step.detail += " SAFETY: Hold the fan blades still with a finger or non-conductive tool while spraying compressed air. Allowing fans to free-spin rapidly can burn out bearings and generate reverse voltage back into the motherboard fan header.";
          changeLog.push({ file, slug: issue.slug, rule: "Fan dusting spin safety" });
        }
      }
    }

    // Rule 4: Modular PSU cables
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      if ((text.includes("pcie cable") || text.includes("modular")) && (text.includes("plug") || text.includes("independent") || text.includes("cable"))) {
        if (issue.slug.includes("psu") || issue.slug.includes("pcie-cable") || text.includes("modular power supply")) {
          if (!step.detail.includes("pinout") && !step.detail.includes("mixing")) {
            step.detail += " CRITICAL SAFETY: Only use modular cables designed specifically for your exact power supply model. Modular PSU pinouts are not standardized across manufacturers; mixing cables can deliver reverse polarity and immediately destroy components.";
            changeLog.push({ file, slug: issue.slug, rule: "Modular PSU cable pinout warning" });
          }
        }
      }
    }

    // Rule 5: BIOS flashing / EEPROM protection
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      const isBiosUpdate =
        text.includes("flash bios") ||
        text.includes("update bios") ||
        text.includes("q-flash") ||
        text.includes("ez flash") ||
        text.includes("bios update") ||
        text.includes("flashback") ||
        (text.includes("bios") && (text.includes("update to the latest") || text.includes("firmware") || text.includes("revision")));
      if (isBiosUpdate && !text.includes("setting") && !text.includes("profile")) {
        if (!step.detail.toLowerCase().includes("interrupt") && !step.detail.toLowerCase().includes("shut off") && !step.detail.toLowerCase().includes("do not turn off") && !step.detail.toLowerCase().includes("power loss")) {
          step.detail += " CRITICAL SAFETY: Never turn off, reset, or unplug the PC while the BIOS update is flashing. A power interruption during EEPROM write will corrupt the firmware and brick the motherboard.";
          changeLog.push({ file, slug: issue.slug, rule: "BIOS flashing interruption protection" });
        }
      }
    }

    // Rule 5b: BitLocker hardware swap
    if (issue.slug === "bitlocker-recovery-screen-on-boot") {
      for (const step of issue.fix_steps) {
        if (step.title.includes("Revert hardware changes") && !step.detail.includes("unplug")) {
          step.detail = "Shut down the PC and unplug the AC power cord first. " + step.detail;
          changeLog.push({ file, slug: issue.slug, rule: "BitLocker hardware revert power isolation" });
        }
      }
    }

    // Rule 6: Diskpart / EFI Partition format data safety
    if (issue.slug.includes("efi") || issue.slug.includes("partition") || issue.slug.includes("diskpart") || issue.slug.includes("bcd")) {
      for (const step of issue.fix_steps) {
        const text = step.detail.toLowerCase();
        if ((text.includes("format") || text.includes("clean")) && !step.detail.includes("DATA SAFETY")) {
          step.detail += " DATA SAFETY: Triple-check that you selected the intended target partition (such as the 100MB to 260MB FAT32 EFI volume) and NEVER your main Windows C: drive or personal data volume, as formatting immediately erases all data.";
          changeLog.push({ file, slug: issue.slug, rule: "Partition format data safety warning" });
        }
      }
    }

    // Rule 7: PCIe latch warning when reseating GPU
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      if ((text.includes("reseat gpu") || text.includes("reseat graphics card") || text.includes("remove the gpu")) && !step.detail.includes("retention")) {
        step.detail += " Always release the plastic PCIe retention lock at the end of the slot before pulling the graphics card to avoid tearing the slot off the motherboard.";
        changeLog.push({ file, slug: issue.slug, rule: "PCIe slot retention lock warning" });
      }
    }

    // Rule 8: RAM slot insertion warning (audible click)
    for (const step of issue.fix_steps) {
      const text = (step.title + " " + step.detail).toLowerCase();
      if ((text.includes("insert") || text.includes("reseat")) && (text.includes("ram") || text.includes("dimm")) && (text.includes("slot a2") || text.includes("module"))) {
        if (!step.detail.includes("click") && !step.detail.includes("latches")) {
          step.detail += " Press firmly on both ends until the retention latches snap shut with an audible click.";
          changeLog.push({ file, slug: issue.slug, rule: "RAM slot latch click confirmation" });
        }
      }
    }

    // Rule 9: Case-open hardware manipulation requires power disconnect step
    const hasPhysicalHw = issue.fix_steps.some((step) => {
      const text = (step.title + " " + step.detail).toLowerCase();
      return HW_KEYWORDS.some((kw) => text.includes(kw));
    });

    if (hasPhysicalHw) {
      const wholeText = (
        issue.title +
        " " +
        issue.summary +
        " " +
        issue.fix_steps.map((s) => s.title + " " + s.detail).join(" ")
      ).toLowerCase();

      const hasPowerDisconnect =
        (wholeText.includes("unplug") || wholeText.includes("switch off") || wholeText.includes("power off") || wholeText.includes("turn off power supply") || wholeText.includes("disconnect power")) &&
        (wholeText.includes("discharge") || wholeText.includes("residual") || wholeText.includes("power cord") || wholeText.includes("wall") || wholeText.includes("drain"));

      if (!hasPowerDisconnect) {
        issue.fix_steps.unshift({ ...SAFETY_ISOLATION_STEP });
        changeLog.push({ file, slug: issue.slug, rule: "Prepend safety power-off & discharge step" });
      }
    }

    // Negative constraint validation: Strictly zero em dashes
    const newJson = JSON.stringify(issue);
    checkNoEmDash(newJson, `${file} -> ${issue.slug}`);

    if (newJson !== originalJson) {
      fileChanged = true;
      totalModified++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, JSON.stringify(issues, null, 2) + "\n", "utf-8");
    console.log(`Updated ${file}`);
  }
}

console.log("\n=================================================");
console.log(`HARDENING V2 COMPLETE: ${totalModified} guides updated.`);
console.log(`Total rule applications: ${changeLog.length}`);
console.log("=================================================");
fs.writeFileSync(
  path.join(process.cwd(), "scripts", "hardening-summary.json"),
  JSON.stringify(changeLog, null, 2)
);

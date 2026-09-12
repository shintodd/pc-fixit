"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Power,
  MonitorX,
  Gauge,
  WifiOff,
  Flame,
  Cpu,
  ArrowRight,
  Wrench,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface TriageProblem {
  slug: string;
  title: string;
  summary: string;
  quickCheck: string;
  severity: "critical" | "warn" | "info";
}

const TRIAGE_TABS = [
  { id: "wont-boot", label: "Won't Boot", icon: Power, color: "text-rose-500", activeBg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" },
  { id: "blue-screen", label: "Blue Screen", icon: MonitorX, color: "text-blue-500", activeBg: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400" },
  { id: "running-slow", label: "Freezes & Lag", icon: Gauge, color: "text-amber-500", activeBg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" },
  { id: "no-internet", label: "No Internet", icon: WifiOff, color: "text-sky-500", activeBg: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400" },
  { id: "overheating", label: "Overheating", icon: Flame, color: "text-orange-500", activeBg: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400" },
  { id: "driver-issues", label: "Device & Drivers", icon: Cpu, color: "text-purple-500", activeBg: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400" },
];

const TRIAGE_DATA: Record<string, TriageProblem[]> = {
  "wont-boot": [
    {
      slug: "no-power-led-off",
      title: "Completely dead: No lights or fan movement",
      summary: "Zero power draw. Typically caused by tripped wall socket, PSU rocker switch, or unplugged front panel header.",
      quickCheck: "Bridge the two motherboard PWR_SW pins with a flathead screwdriver to bypass a broken case power button.",
      severity: "critical",
    },
    {
      slug: "fans-spin-briefly",
      title: "Fans spin for half a second then immediately shut off",
      summary: "Short circuit protection (SCP) trips immediately to prevent component burning.",
      quickCheck: "Disconnect front USB 3.0 header and all SATA RGB cables. Check for bent pins inside USB ports.",
      severity: "critical",
    },
    {
      slug: "no-post-dram-led",
      title: "Fans spin, monitor black, solid DRAM debug LED",
      summary: "Memory training failure or unseated DDR4/DDR5 RAM module.",
      quickCheck: "Remove all RAM sticks. Insert only one stick firmly into slot A2 until both clips click audibly.",
      severity: "critical",
    },
    {
      slug: "cmos-battery-dead-date-reset",
      title: "BIOS time and memory settings reset on every boot",
      summary: "Depleted CR2032 3V coin cell battery loses CMOS NVRAM whenever AC power cord is switched off.",
      quickCheck: "Replace the CR2032 coin battery on motherboard with a fresh 3V cell (positive side facing up).",
      severity: "warn",
    },
  ],
  "blue-screen": [
    {
      slug: "irql-not-less-or-equal",
      title: "IRQL_NOT_LESS_OR_EQUAL (0x0000000A)",
      summary: "Kernel process or driver attempted accessing high-level pageable memory without permission.",
      quickCheck: "Clean reinstall GPU driver with DDU in Safe Mode. Test RAM stability with mdsched.exe.",
      severity: "critical",
    },
    {
      slug: "whea-uncorrectable-error",
      title: "WHEA_UNCORRECTABLE_ERROR (0x00000124)",
      summary: "Fatal hardware architecture error signaled by CPU, PCIe bus, or unstable core voltage offset.",
      quickCheck: "Disable CPU undervolting and Curve Optimizer in BIOS. Verify CPU cooler is mounted securely.",
      severity: "critical",
    },
    {
      slug: "dpc-watchdog-violation",
      title: "DPC_WATCHDOG_VIOLATION (0x00000133)",
      summary: "Deferred Procedure Call hung longer than system timeout, often caused by outdated NVMe SSD firmware.",
      quickCheck: "Update storage controller driver to Standard NVM Express Controller and update SSD firmware.",
      severity: "critical",
    },
    {
      slug: "bsod-video-scheduler-internal-error",
      title: "VIDEO_SCHEDULER_INTERNAL_ERROR (0x00000119)",
      summary: "Display driver timed out during GPU command scheduling.",
      quickCheck: "Disable Hardware-accelerated GPU scheduling (HAGS) in Windows Display Graphics settings.",
      severity: "critical",
    },
  ],
  "running-slow": [
    {
      slug: "100-percent-disk-usage",
      title: "Disk usage locked at 100% with response times over 1000ms",
      summary: "Background indexing or telemetry queue saturates storage I/O bandwidth.",
      quickCheck: "Disable SysMain service in services.msc. Verify disk health in CrystalDiskInfo.",
      severity: "warn",
    },
    {
      slug: "prochot-vrm-throttling-0-79ghz",
      title: "CPU locked at 0.79 GHz from motherboard PROCHOT throttle",
      summary: "Motherboard VRM sensor or stuck EC temperature flag locks CPU multiplier to minimum 8x.",
      quickCheck: "Perform 30-second AC power drain. Verify motherboard VRM temperatures in HWInfo64.",
      severity: "critical",
    },
    {
      slug: "tiworker-trustedinstaller-high-cpu",
      title: "TiWorker.exe (Windows Modules Installer) 100% CPU",
      summary: "Windows Update background servicing engine stuck in an infinite scan or installation loop.",
      quickCheck: "Run DISM /Online /Cleanup-Image /StartComponentCleanup in Administrator Command Prompt.",
      severity: "warn",
    },
    {
      slug: "onedrive-sync-constant-cpu-disk-lockup",
      title: "OneDrive constant file scanning and high CPU lockup",
      summary: "Sync engine looping over thousands of small cache or developer files.",
      quickCheck: "Run: onedrive.exe /reset from Run dialog, or pause syncing for 2 hours.",
      severity: "warn",
    },
  ],
  "no-internet": [
    {
      slug: "dns-server-not-responding",
      title: "DNS server not responding: Websites fail to load",
      summary: "ISP resolver dropped queries or DNS cache is corrupted.",
      quickCheck: "Execute: ipconfig /flushdns in CMD, and set primary DNS to 1.1.1.1 and 8.8.8.8.",
      severity: "warn",
    },
    {
      slug: "default-gateway-not-available",
      title: "The default gateway is not available (yellow triangle)",
      summary: "Network adapter loses route connectivity to local router during power management state.",
      quickCheck: "Uncheck 'Allow computer to turn off this device to save power' in adapter Device Manager properties.",
      severity: "warn",
    },
    {
      slug: "ethernet-drops-intel-i225v-i226v",
      title: "Intel I225-V / I226-V 2.5G Ethernet micro-disconnects",
      summary: "Energy Efficient Ethernet (EEE) powers down transceiver during live gaming sessions.",
      quickCheck: "Disable Energy Efficient Ethernet and Ultra Low Power Mode in Device Manager Advanced tab.",
      severity: "warn",
    },
    {
      slug: "wifi-invalid-ip-configuration-169-254",
      title: "Wi-Fi does not have a valid IP configuration (169.254.x.x)",
      summary: "Computer failed to negotiate a DHCP lease, defaulting to unroutable APIPA subnet.",
      quickCheck: "Run: ipconfig /release followed by ipconfig /renew in elevated Command Prompt.",
      severity: "critical",
    },
  ],
  "overheating": [
    {
      slug: "cpu-thermal-shutdown-under-load",
      title: "PC turns off abruptly during gaming or rendering",
      summary: "Processor reaches TJMax thermal junction (100C - 105C), triggering hardware emergency shutdown.",
      quickCheck: "Verify cooler mounting pressure. Confirm clear plastic protective sticker was peeled from cooler base.",
      severity: "critical",
    },
    {
      slug: "aio-liquid-cooler-pump-failure",
      title: "AIO liquid cooler pump failure (instant 100C spike on idle)",
      summary: "Liquid pump motor impeller stalled or failed, leaving coolant static in CPU block.",
      quickCheck: "Touch both coolant tubes. If one tube is scorching hot and the other is cold, pump is dead.",
      severity: "critical",
    },
    {
      slug: "gpu-vram-memory-junction-thermal-throttle",
      title: "GDDR6X VRAM memory junction overheating (105C - 110C)",
      summary: "Degraded or oily factory memory thermal pads causing aggressive GPU downclocking.",
      quickCheck: "Cap in-game FPS to monitor refresh rate. Replace stock VRAM pads with high-conductivity pads.",
      severity: "critical",
    },
    {
      slug: "motherboard-fan-speed-stuck-100-percent",
      title: "Case fans stuck at 100% speed jet engine noise",
      summary: "4-pin PWM fans receiving 12V constant voltage due to legacy DC mode in BIOS.",
      quickCheck: "Open BIOS Hardware Monitor / Q-Fan and toggle fan header mode from DC to PWM.",
      severity: "info",
    },
  ],
  "driver-issues": [
    {
      slug: "gpu-driver-crash-black-screen",
      title: "Display driver nvlddmkm or amdkmdag stopped responding",
      summary: "GPU driver crashed and failed Timeout Detection and Recovery (TDR) reset.",
      quickCheck: "Restart graphics driver instantly with Windows shortcut: Win + Ctrl + Shift + B.",
      severity: "critical",
    },
    {
      slug: "device-manager-code-43",
      title: "Windows has stopped this device (Code 43) on graphics card",
      summary: "Hardware reports internal fault or driver failed communication handshake.",
      quickCheck: "Perform clean driver install with DDU. Reseat graphics card into primary PCIe x16 slot.",
      severity: "critical",
    },
    {
      slug: "usb-hub-power-surge-exceeded",
      title: "Power surge on USB port: Device exceeded power limits",
      summary: "Damaged port or shorted cable drawing over 500mA/900mA current limit.",
      quickCheck: "Unplug all USB devices. Inspect internal port plastic tabs with a flashlight for bent pins.",
      severity: "critical",
    },
    {
      slug: "realtek-audio-front-panel-jack-not-detected",
      title: "Front panel 3.5mm headphone jack produces no sound",
      summary: "Impedance detection mismatch between motherboard HD Audio and case wiring.",
      quickCheck: "Open Realtek Audio Console > Settings > Toggle 'Disable front panel jack detection' to ON.",
      severity: "warn",
    },
  ],
};

export default function QuickTriageDeck() {
  const [activeTab, setActiveTab] = useState("wont-boot");
  const problems = TRIAGE_DATA[activeTab] || TRIAGE_DATA["wont-boot"];

  return (
    <section className="relative mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-12">
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-surface px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent shadow-xs mb-2.5">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Instant Symptom Triage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-dark-ink">
            Find Your Exact Failure Point
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-secondary dark:text-dark-ink-secondary max-w-xl">
            Select what your PC is doing to see the most frequent verified hardware and OS causes.
          </p>
        </div>

        <Link
          href="/wizard"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-accent dark:text-dark-accent hover:underline shrink-0"
        >
          <span>Need full diagnostic wizard?</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
        {TRIAGE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? `${tab.activeBg} shadow-xs`
                  : "border-line dark:border-dark-line bg-white/70 dark:bg-dark-card/70 text-ink-secondary dark:text-dark-ink-secondary hover:border-line-strong dark:hover:border-dark-line-strong hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Icon className={`h-4 w-4 ${tab.color}`} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Problem Cards Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="wait">
          {problems.map((prob, idx) => (
            <motion.div
              key={`${activeTab}-${prob.slug}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, delay: idx * 0.04 }}
              className="group flex flex-col justify-between rounded-2xl border border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95 p-5 shadow-card dark:shadow-card-dark backdrop-blur-md transition-all duration-200 hover:border-accent/40 dark:hover:border-dark-accent/40 hover:shadow-card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      prob.severity === "critical"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    <span>{prob.severity}</span>
                  </span>

                  <Link
                    href={`/issues/${prob.slug}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-subtle dark:bg-dark-subtle text-ink-tertiary dark:text-dark-ink-tertiary group-hover:bg-accent group-hover:text-white transition-colors"
                    aria-label={`Open guide: ${prob.title}`}
                  >
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>

                <h3 className="text-[16px] font-bold tracking-tight text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                  <Link href={`/issues/${prob.slug}`}>
                    {prob.title}
                  </Link>
                </h3>

                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
                  {prob.summary}
                </p>
              </div>

              {/* Quick Check Box */}
              <div className="mt-4 rounded-xl border border-line/70 dark:border-dark-line/70 bg-subtle/50 dark:bg-dark-subtle/50 p-3 text-[12px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-dark-ink mb-1">
                  <Wrench className="h-3 w-3 text-accent dark:text-dark-accent" aria-hidden="true" />
                  <span>Immediate Step:</span>
                </div>
                <div className="text-ink-secondary dark:text-dark-ink-secondary">
                  {prob.quickCheck}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

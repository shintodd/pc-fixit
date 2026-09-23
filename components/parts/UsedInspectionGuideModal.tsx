"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldAlert, Cpu, Monitor, HardDrive, Zap, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UsedInspectionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsedInspectionGuideModal({ isOpen, onClose }: UsedInspectionGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"gpu" | "cpu" | "mobo" | "ram" | "storage">("gpu");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="used-guide-title"
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[18px] bg-canvas border border-line shadow-2xl overflow-hidden dark:bg-dark-surface dark:border-dark-line"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="used-guide-title" className="text-lg font-semibold text-ink dark:text-white">
                  Malaysian Second-Hand Inspection Guide
                </h2>
                <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                  Essential physical checks and stress tests before paying cash on Carousell or Mudah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted-80 hover:bg-subtle hover:text-ink transition-colors dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close inspection guide"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-line dark:border-dark-line overflow-x-auto scrollbar-none bg-canvas dark:bg-dark-surface">
            {[
              { id: "gpu", label: "Graphics Card (GPU)", icon: Monitor },
              { id: "cpu", label: "Processor (CPU)", icon: Cpu },
              { id: "mobo", label: "Motherboard", icon: Zap },
              { id: "ram", label: "Memory (RAM)", icon: CheckCircle2 },
              { id: "storage", label: "Storage & PSU", icon: HardDrive },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                      : "text-ink-muted-80 hover:bg-subtle hover:text-ink dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-ink dark:text-white">
            {activeTab === "gpu" && (
              <div className="space-y-4">
                <div className="rounded-[14px] bg-amber-500/10 border border-amber-500/20 p-4 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">High Risk Component</p>
                    <p>
                      Used GPUs are prone to thermal paste pump-out, damaged fan bearings, and crypto mining VRAM degradation. Always ask for live FurMark testing or COD (Cash on Delivery) testing at seller place.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">1</span>
                    Physical Inspection Checklist
                  </h3>
                  <ul className="space-y-2 text-xs text-ink-muted-80 dark:text-dark-muted pl-7 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>PCB Backside:</strong> Inspect for yellow oily residue (leaking thermal pads from 24/7 mining) or brown discoloration around GPU core.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>Fan Bearings:</strong> Gently spin each fan blade with your finger. It should spin smoothly and silently without wobbling or rattling.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>PCIe Connector Fingers:</strong> Check gold contacts for deep scratches, cracks, or burnt pins.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>Display Ports:</strong> Ensure HDMI and DisplayPort sockets are firm and free of rust or oxidation.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">2</span>
                    Software Stress Tests Before Payment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-[12px] border border-line bg-canvas-parchment/40 dark:border-dark-line dark:bg-dark-subtle/30">
                      <p className="font-semibold text-ink dark:text-white">FurMark 2 Stress Test (15 Mins)</p>
                      <p className="mt-1 text-ink-muted-80 dark:text-dark-muted">
                        Target GPU core temperature should stabilize under 78C, and Hotspot under 95C. If screen shows checkered pink artifacting or PC crashes, walk away.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-[12px] border border-line bg-canvas-parchment/40 dark:border-dark-line dark:bg-dark-subtle/30">
                      <p className="font-semibold text-ink dark:text-white">GPU-Z Sensors Check</p>
                      <p className="mt-1 text-ink-muted-80 dark:text-dark-muted">
                        Confirm PCIe link speed is running at PCIe x16 (not stuck at x1 or x4), and VRAM temperature is within normal spec.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cpu" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">1</span>
                    Socket Pin Inspection
                  </h3>
                  <div className="text-xs text-ink-muted-80 dark:text-dark-muted space-y-2">
                    <p>
                      <strong>AMD AM4 Processors (PGA):</strong> Ryzen 5 5600, 5700X have pins directly on the CPU underside. Use your phone camera with flash and 3x zoom to scan the grid. A single bent pin can disable memory channels or prevent POST.
                    </p>
                    <p>
                      <strong>AMD AM5 & Intel LGA1700 (LGA):</strong> Pins are on the motherboard socket, but inspect the CPU gold pads for deep scratches or thermal paste contamination on contact surfaces.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">2</span>
                    Memory Controller Verification
                  </h3>
                  <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                    Degraded CPUs often fail to train dual-channel memory. Ensure Windows Task Manager confirms both RAM sticks are recognized at full rated XMP/EXPO speed (e.g. 16GB dual-channel, not 8GB single-channel).
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">3</span>
                    Cinebench R23 10-Minute Loop
                  </h3>
                  <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                    Run one 10-minute multi-core loop in Cinebench R23. The CPU must not thermal throttle above 95C and must not trigger Windows stop codes (WHEA_UNCORRECTABLE_ERROR).
                  </p>
                </div>
              </div>
            )}

            {activeTab === "mobo" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">1</span>
                    Motherboard Physical Traps
                  </h3>
                  <ul className="space-y-2 text-xs text-ink-muted-80 dark:text-dark-muted pl-7 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>CPU Socket Pins:</strong> On LGA1700 and AM5 boards, inspect every tiny socket spring pin. Bent pins are the #1 cause of dead RAM slots.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>PCIe Retention Clips:</strong> Make sure the plastic retention latch on the top PCIe x16 slot is intact and not broken off.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>M.2 Standoffs & Screws:</strong> Ensure tiny M.2 mounting screws and heat shields are provided in the box.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>Rear I/O Shield:</strong> Confirm the metallic I/O backplate is included if it is not pre-installed.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "ram" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">1</span>
                    Second-Hand RAM Safe Buys
                  </h3>
                  <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                    RAM is one of the safest second-hand components to buy because standard modules lack moving parts and carry lifetime warranties from brands like Kingston, Corsair, and G.Skill in Malaysia.
                  </p>
                  <ul className="space-y-2 text-xs text-ink-muted-80 dark:text-dark-muted pl-7 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>Matching Serial Numbers:</strong> Check sticker on modules to verify both sticks belong to a factory-matched dual channel kit.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span><strong>MemTest86 Quick Pass:</strong> Run Windows Memory Diagnostic (mdsched.exe) to guarantee zero memory address corruption.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-4">
                <div className="rounded-[14px] bg-rose-500/10 border border-rose-500/20 p-4 text-rose-800 dark:text-rose-300 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">pcfix Safety Recommendation: Buy New for Storage & PSU</p>
                    <p>
                      In our Smart Hybrid builds, we strictly lock PSUs and SSDs to brand-new units. Power supplies degrade silently over time, and worn NVMe drives risk catastrophic data loss.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">1</span>
                    If You Must Buy Used SSD:
                  </h3>
                  <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                    Ask seller for a screenshot of <strong>CrystalDiskInfo</strong>. Verify:
                  </p>
                  <ul className="space-y-1.5 text-xs text-ink-muted-80 dark:text-dark-muted pl-7 list-none">
                    <li>- Health Status must be 90% or higher.</li>
                    <li>- Total Host Writes (TBW) must be under 30% of rated endurance.</li>
                    <li>- Reallocated Sectors Count must be zero.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent text-xs">2</span>
                    Why Used PSUs Are Dangerous:
                  </h3>
                  <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                    Electrolytic capacitors dry out after 3-5 years of Malaysian tropical heat and humidity. A failing used power supply can surge high voltage through the 12V rail and permanently destroy your motherboard, CPU, and graphics card simultaneously. Always invest in a brand-new Tier B or higher 80+ Bronze/Gold power supply.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50 text-xs">
            <span className="text-ink-muted-80 dark:text-dark-muted">
              pcfix hardware safety guidelines - Zero sponsored bias
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

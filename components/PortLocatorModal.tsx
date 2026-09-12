"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Monitor, Zap, Cable, Check, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PortLocatorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"ports" | "cables">("ports");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMs = language === "ms";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="port-modal-title"
          className="glass-element glass-adaptive relative w-full max-w-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:text-dark-accent">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <h2 id="port-modal-title" className="text-lg font-bold text-ink dark:text-dark-ink">
                  {isMs ? "Panduan Port & Wayar PC" : "PC Ports & Cable Visual Guide"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Elak kesilapan paling kerap: salah cucuk kabel atau suis tak on."
                    : "Avoid the #1 beginner mistake: wrong monitor port or power switch position."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-subtle dark:bg-dark-subtle p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("ports")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "ports"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>{isMs ? "Port Belakang PC" : "Back Panel Ports"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cables")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "cables"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Cable className="h-4 w-4" />
              <span>{isMs ? "Pengecam Kabel" : "Cable Identifier"}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-[13px]">
            {activeTab === "ports" ? (
              <div className="space-y-4">
                {/* Visual Illustration Cards */}
                <div className="rounded-2xl border border-critical/30 bg-critical/5 dark:bg-critical/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-critical font-bold text-[13px]">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{isMs ? "PORT ATAS (Motherboard): SALAH untuk PC ada GPU" : "TOP PORTS (Motherboard): WRONG if GPU installed"}</span>
                  </div>
                  <p className="text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                    {isMs
                      ? "Jika casing anda mempunyai kad grafik (GPU) di bahagian bawah, port HDMI/DisplayPort di bahagian atas motherboard akan dimatikan secara automatik oleh BIOS. Skrin akan kekal hitam."
                      : "If your computer has a dedicated graphics card (GPU) installed below, the top motherboard display ports are automatically disabled. Plugging here causes a black screen."}
                  </p>
                </div>

                <div className="rounded-2xl border border-ok/30 bg-ok/5 dark:bg-ok/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-ok font-bold text-[13px]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isMs ? "PORT BAWAH (Kad Grafik GPU): BETUL & WAJIB" : "BOTTOM HORIZONTAL PORTS (Graphics Card): CORRECT"}</span>
                  </div>
                  <p className="text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                    {isMs
                      ? "Sentiasa cucuk kabel HDMI atau DisplayPort anda terus ke barisan slot mendatar di bahagian bawah casing. Ini port sebenar yang menghasilkan gambar."
                      : "Always plug your monitor cable directly into the horizontal metal bracket ports near the bottom of the PC. This is where your graphics card outputs display."}
                  </p>
                </div>

                {/* PSU Rocker Switch */}
                <div className="rounded-2xl border border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-ink dark:text-dark-ink text-[13px]">
                    <Zap className="h-4 w-4 text-accent" />
                    <span>{isMs ? "Suis Power Supply (I vs O)" : "Power Supply Toggle Switch (I vs O)"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl border border-ok/40 bg-white dark:bg-dark-card p-3">
                      <div className="font-bold text-ok text-[14px]">I (Garis) = ON</div>
                      <div className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary mt-1">
                        {isMs ? "Tekan belah garis (I) ke dalam untuk salur elektrik." : "Press the line side (I) in to allow wall power."}
                      </div>
                    </div>
                    <div className="rounded-xl border border-critical/40 bg-white dark:bg-dark-card p-3">
                      <div className="font-bold text-critical text-[14px]">O (Bulatan) = OFF</div>
                      <div className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary mt-1">
                        {isMs ? "Belah bulatan (O) potong bekalan elektrik sepenuhnya." : "Circle side (O) completely cuts all electrical power."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Cable Comparisons */}
                <div className="rounded-2xl border border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 p-4 space-y-2">
                  <div className="font-bold text-ink dark:text-dark-ink flex items-center justify-between">
                    <span>DisplayPort vs HDMI</span>
                    <span className="text-[11px] rounded-full bg-accent/10 px-2 py-0.5 text-accent font-medium">Video</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded-xl bg-white dark:bg-dark-card p-3 border border-line/60 dark:border-dark-line">
                      <span className="font-bold text-ink dark:text-dark-ink block">DisplayPort (DP)</span>
                      <p className="text-ink-secondary dark:text-dark-ink-secondary mt-1">
                        {isMs
                          ? "Satu bucu senget flat, ada butang klip kecil. Tarik sambil tekan klip."
                          : "Has one angled corner and a small release button. Squeeze button to unplug."}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-dark-card p-3 border border-line/60 dark:border-dark-line">
                      <span className="font-bold text-ink dark:text-dark-ink block">HDMI</span>
                      <p className="text-ink-secondary dark:text-dark-ink-secondary mt-1">
                        {isMs
                          ? "Bentuk simetri trapezoid leper. Tiada klip pengunci."
                          : "Symmetric trapezoid shape with two sloped bottom corners. Pulls straight out."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-critical/20 bg-critical/5 dark:bg-critical/10 p-4 space-y-2">
                  <div className="font-bold text-critical flex items-center justify-between">
                    <span>{isMs ? "Amaran: Wayar PCIe GPU vs CPU 8-Pin" : "Danger: PCIe 8-Pin (GPU) vs CPU 8-Pin"}</span>
                    <span className="text-[11px] rounded-full bg-critical/20 px-2 py-0.5 text-critical font-medium">Power</span>
                  </div>
                  <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                    {isMs
                      ? "JANGAN sesekali paksa wayar CPU 8-pin (4+4) masuk ke kad grafik GPU. Gunakan HANYA wayar berlabel 'PCIe' atau 'VGA' (6+2 pin). Salah cucuk boleh menyebabkan litar pintas."
                      : "NEVER force a CPU 8-pin (4+4) cable into a graphics card. Use ONLY cables labeled 'PCIe' or 'VGA' (6+2 pins). Swapping them causes short circuits."}
                  </p>
                </div>

                <div className="rounded-2xl border border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 p-4 space-y-2">
                  <div className="font-bold text-ink dark:text-dark-ink">
                    {isMs ? "Wayar Suis Power Casing (Front Panel Header)" : "Front Panel Power Switch Wire"}
                  </div>
                  <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                    {isMs
                      ? "Wayar kecil 2-pin bertulis 'POWER SW'. Jika tercabut daripada motherboard, menekan butang power depan langsung tidak akan menghidupkan PC."
                      : "The tiny 2-pin connector labeled 'POWER SW'. If disconnected from the motherboard bottom-right header, pressing your case button does nothing."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-line dark:border-dark-line flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-pill bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all"
            >
              {isMs ? "Faham, Tutup Panduan" : "Got It, Close Guide"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

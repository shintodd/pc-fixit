"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, ShieldAlert, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PinDetail {
  pinNumber: number;
  label: string;
  nameEn: string;
  nameMs: string;
  color: string;
  polarity: "+ / Positive" | "- / Ground" | "No Polarity";
  notesEn: string;
  notesMs: string;
}

const PINS: Record<number, PinDetail> = {
  1: {
    pinNumber: 1,
    label: "HDD LED +",
    nameEn: "Hard Drive Activity LED (Positive)",
    nameMs: "Lampu Aktiviti Hard Drive (Positif)",
    color: "bg-amber-500 text-white",
    polarity: "+ / Positive",
    notesEn: "Positive anode. Reversing this will cause the front drive blink light to not turn on.",
    notesMs: "Kaki positif. Jika terbalik, lampu kelip drive pada casing tidak akan menyala.",
  },
  2: {
    pinNumber: 2,
    label: "PWR LED +",
    nameEn: "Power Status LED (Positive)",
    nameMs: "Lampu Kuasa Status (Positif)",
    color: "bg-emerald-500 text-white",
    polarity: "+ / Positive",
    notesEn: "Positive anode for computer power indicator light.",
    notesMs: "Kaki positif untuk lampu tanda kuasa PC menyala.",
  },
  3: {
    pinNumber: 3,
    label: "HDD LED -",
    nameEn: "Hard Drive Activity LED (Ground)",
    nameMs: "Lampu Aktiviti Hard Drive (Negatif)",
    color: "bg-amber-700 text-white",
    polarity: "- / Ground",
    notesEn: "Negative ground cathode for drive activity LED.",
    notesMs: "Kaki negatif / bumi untuk lampu aktiviti drive.",
  },
  4: {
    pinNumber: 4,
    label: "PWR LED -",
    nameEn: "Power Status LED (Ground)",
    nameMs: "Lampu Kuasa Status (Negatif)",
    color: "bg-emerald-700 text-white",
    polarity: "- / Ground",
    notesEn: "Negative ground cathode for power indicator light.",
    notesMs: "Kaki negatif / bumi untuk lampu tanda kuasa.",
  },
  5: {
    pinNumber: 5,
    label: "RESET SW",
    nameEn: "Reset Switch",
    nameMs: "Suis Butang Reset",
    color: "bg-blue-500 text-white",
    polarity: "No Polarity",
    notesEn: "Momentary switch. Polarity does not matter. Works in either orientation.",
    notesMs: "Suis litar sentuh. Orientasi terbalik tidak mengapa, tetap berfungsi sama.",
  },
  6: {
    pinNumber: 6,
    label: "PWR SW",
    nameEn: "Power Switch (PWR_BTN)",
    nameMs: "Suis Butang Hidup Kuasa (PWR_BTN)",
    color: "bg-rose-500 text-white",
    polarity: "No Polarity",
    notesEn: "Crucial pin. Momentary switch. Polarity does not matter. Works in either direction.",
    notesMs: "Pin utama. Suis litar sentuh. Orientasi terbalik tidak mengapa, tetap berfungsi.",
  },
  7: {
    pinNumber: 7,
    label: "RESET SW (GND)",
    nameEn: "Reset Switch Ground",
    nameMs: "Bumi Suis Reset",
    color: "bg-blue-700 text-white",
    polarity: "No Polarity",
    notesEn: "Completes reset loop back to chipset ground.",
    notesMs: "Melengkapkan litar reset ke bumi chipset.",
  },
  8: {
    pinNumber: 8,
    label: "PWR SW (GND)",
    nameEn: "Power Switch Ground",
    nameMs: "Bumi Suis Kuasa",
    color: "bg-rose-700 text-white",
    polarity: "No Polarity",
    notesEn: "Completes power-on loop. Bridging Pin 6 and Pin 8 triggers system startup.",
    notesMs: "Melengkapkan litar kuasa. Menyentuhkan Pin 6 dan Pin 8 akan menghidupkan PC.",
  },
  10: {
    pinNumber: 10,
    label: "KEY / NC",
    nameEn: "Keyed Pin (Missing / Blank)",
    nameMs: "Pin Kosong (Penanda Arah)",
    color: "bg-slate-300 dark:bg-slate-700 text-slate-500",
    polarity: "No Polarity",
    notesEn: "No physical pin exists here. This empty spot prevents plugging front connectors upside down.",
    notesMs: "Tiada jarum pin di sini. Ruang kosong ini menghalang wayar dipasang terbalik.",
  },
};

export default function FrontPanelPinoutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState<"wiring" | "jumpstart">("wiring");
  const [selectedPin, setSelectedPin] = useState<PinDetail>(PINS[6]);
  const [isJumpstarting, setIsJumpstarting] = useState(false);
  const [jumpstartSuccess, setJumpstartSuccess] = useState(false);

  const isMs = language === "ms";

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function triggerJumpstart() {
    if (isJumpstarting) return;
    setIsJumpstarting(true);
    setJumpstartSuccess(false);

    setTimeout(() => {
      setJumpstartSuccess(true);
      setTimeout(() => {
        setIsJumpstarting(false);
      }, 1600);
    }, 700);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pinout-modal-title"
          className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-dark-card border border-line dark:border-dark-line shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 id="pinout-modal-title" className="font-bold text-[16px] text-ink dark:text-dark-ink">
                  {isMs ? "Visualizer Pin Front Panel & Jumpstart" : "Front-Panel Pinout & Jumpstart Visualizer"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Susunan wayar suis kuasa, lampu LED casing, dan cara hidupkan PC tanpa butang."
                    : "Standard 9-pin Intel layout: power switch, reset, activity LEDs, and screwdriver test."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-subtle dark:bg-dark-subtle p-1 mx-5 mt-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode("wiring")}
              className={`flex-1 flex min-h-[44px] items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeMode === "wiring"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>{isMs ? "Susunan Wayar Casing" : "Connector Wiring Guide"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("jumpstart")}
              className={`flex-1 flex min-h-[44px] items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeMode === "jumpstart"
                  ? "bg-white dark:bg-dark-card text-rose-500 dark:text-rose-400 shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{isMs ? "Ujian Pemutar Skru (Jumpstart)" : "Screwdriver Jumpstart Mode"}</span>
            </button>
          </div>

          {/* Modal Scroll Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-[13px]">
            {/* Header Canvas View */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Motherboard JFP1 / FRONT_PANEL Header (9-Pin Standard)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {isMs ? "Pandangan dari Hadapan Motherboard" : "Top-Down Board View"}
                </span>
              </div>

              {/* Pin Grid Graphic */}
              <div className="my-4 flex flex-col items-center justify-center">
                {/* Top Row (Pins 2, 4, 6, 8, 10) */}
                <div className="flex items-center gap-4 sm:gap-6 mb-3">
                  {[2, 4, 6, 8, 10].map((pinNum) => {
                    const pin = PINS[pinNum];
                    const isKey = pinNum === 10;
                    const isPwrPin = pinNum === 6 || pinNum === 8;
                    const isSelected = selectedPin?.pinNumber === pinNum;
                    const isJumpTarget = activeMode === "jumpstart" && isPwrPin;

                    return (
                      <button
                        key={pinNum}
                        type="button"
                        onClick={() => pin && setSelectedPin(pin)}
                        aria-label={`Pin ${pinNum}: ${isKey ? "Keyed Blank" : pin.label}`}
                        className="flex flex-col items-center group relative min-h-[44px] justify-center focus-visible:outline-none"
                        disabled={isKey}
                      >
                        <span className="text-[10px] font-mono text-slate-400 mb-1">
                          P{pinNum}
                        </span>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                            isKey
                              ? "border border-dashed border-slate-700 bg-transparent text-slate-600 cursor-not-allowed"
                              : isJumpTarget
                              ? "bg-rose-500 text-white ring-4 ring-rose-500/40 scale-110 shadow-lg"
                              : isSelected
                              ? "bg-accent text-white ring-4 ring-accent/30 scale-105"
                              : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600"
                          }`}
                        >
                          {isKey ? "X" : pinNum}
                        </div>
                        <span className="text-[9px] font-mono text-slate-300 mt-1 max-w-[50px] text-center truncate">
                          {isKey ? "Blank" : pin.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Divider Line */}
                <div className="w-full max-w-xs h-px bg-slate-800 my-1 relative">
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2 text-[9px] bg-slate-950 px-2 text-slate-500 font-mono">
                    NOTCH / KEY
                  </span>
                </div>

                {/* Bottom Row (Pins 1, 3, 5, 7, 9) */}
                <div className="flex items-center gap-4 sm:gap-6 mt-3">
                  {[1, 3, 5, 7, 9].map((pinNum) => {
                    const pin = PINS[pinNum];
                    const isBlank = pinNum === 9;
                    const isSelected = selectedPin?.pinNumber === pinNum;

                    return (
                      <button
                        key={pinNum}
                        type="button"
                        onClick={() => pin && setSelectedPin(pin)}
                        aria-label={`Pin ${pinNum}: ${isBlank ? "Empty" : pin?.label}`}
                        className="flex flex-col items-center group relative min-h-[44px] justify-center focus-visible:outline-none"
                        disabled={isBlank}
                      >
                        <span className="text-[10px] font-mono text-slate-400 mb-1">
                          P{pinNum}
                        </span>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                            isBlank
                              ? "border border-dashed border-slate-700 bg-transparent text-slate-600 cursor-not-allowed"
                              : isSelected
                              ? "bg-accent text-white ring-4 ring-accent/30 scale-105"
                              : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600"
                          }`}
                        >
                          {isBlank ? "-" : pinNum}
                        </div>
                        <span className="text-[9px] font-mono text-slate-300 mt-1 max-w-[50px] text-center truncate">
                          {isBlank ? "Empty" : pin?.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jumpstart Mode Action Banner */}
              {activeMode === "jumpstart" && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[12px] text-slate-300">
                    <span className="text-rose-400 font-bold block">
                      {isMs ? "Sentuh Pin 6 & Pin 8 bersama" : "Bridge Pin 6 and Pin 8"}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {isMs
                        ? "Sentuh mata pemutar skru rata pada dua pin merah ini selama 1 saat sahaja."
                        : "Touch the tip of a metal flathead screwdriver across pins 6 and 8 for 1 second."}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={triggerJumpstart}
                    disabled={isJumpstarting}
                    className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                      jumpstartSuccess
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-rose-600 hover:bg-rose-500 text-white"
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>
                      {isJumpstarting
                        ? isMs
                          ? "Menyentuh..."
                          : "Bridging pins..."
                        : jumpstartSuccess
                        ? isMs
                          ? "PC Berjaya Dihidupkan!"
                          : "System Boot Triggered!"
                        : isMs
                        ? "Simulasi Jumpstart"
                        : "Simulate Jumpstart"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Selected Pin Details Card */}
            {activeMode === "wiring" && selectedPin && (
              <div className="p-4 rounded-2xl border border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${selectedPin.color}`}>
                      Pin {selectedPin.pinNumber}
                    </span>
                    <span className="font-bold text-ink dark:text-dark-ink text-[14px]">
                      {isMs ? selectedPin.nameMs : selectedPin.nameEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-dark-card border border-line dark:border-dark-line text-ink-secondary dark:text-dark-ink-secondary">
                    {selectedPin.polarity}
                  </span>
                </div>
                <p className="text-ink-secondary dark:text-dark-ink-secondary text-[12px] leading-relaxed">
                  {isMs ? selectedPin.notesMs : selectedPin.notesEn}
                </p>
              </div>
            )}

            {/* Vital Safety Warnings */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-[12px]">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {isMs ? "Peraturan Keselamatan Penting" : "Critical Safety Rules"}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-ink-secondary dark:text-dark-ink-secondary pl-1">
                <li>
                  {isMs
                    ? "Butang Kuasa (PWR_SW) dan Butang Reset (RESET_SW) TIDAK ADA kutub positif/negatif. Dipasang terbalik tetap berfungsi."
                    : "Power Switch (PWR_SW) and Reset Switch (RESET_SW) have NO polarity. They work in either orientation."}
                </li>
                <li>
                  {isMs
                    ? "Lampu LED (PWR_LED, HDD_LED) MEMPUNYAI kutub (+ dan -). Wayar berwarna adalah Positif (+), wayar hitam/putih adalah Negatif (-)."
                    : "LEDs (PWR_LED, HDD_LED) HAVE polarity (+ and -). Colored wire is Positive (+), black or white wire is Negative (-)."}
                </li>
                <li>
                  {isMs
                    ? "Untuk ujian jumpstart, sentuh HANYA Pin 6 & 8. JANGAN sentuh pin USB 5V, Audio, atau pin RGB 12V kerana boleh merosakkan papan litar."
                    : "For jumpstart testing, touch ONLY Pins 6 and 8. NEVER touch 12V RGB, USB, or Audio headers with metal tools."}
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

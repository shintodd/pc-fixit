"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, CheckCircle2, AlertCircle, HelpCircle, DollarSign, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RepairFeasibilityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [pcAge, setPcAge] = useState<"new" | "mid" | "old">("mid");
  const [issueType, setIssueType] = useState<"free" | "cmos" | "psu" | "gpu">("free");

  const isMs = language === "ms";

  // Evaluation logic
  const evaluation = {
    free: {
      score: "HIGH",
      badgeClass: "bg-ok/10 text-ok border-ok/30",
      costEn: "$0 (Free Fix)",
      costMs: "RM 0 (Percuma)",
      verdictEn: "100% Worth Fixing! This is a zero-cost software, driver, or cable connection issue.",
      verdictMs: "100% Berbaloi Dibaiki! Ini cuma isu sambungan kabel, tetapan Windows, atau driver percuma.",
      adviceEn: "Never pay a repair shop for simple driver crashes or loose cables. Follow the step checklist first.",
      adviceMs: "Jangan bayar kedai untuk masalah driver atau kabel longgar. Cuba langkah percuma dulu.",
    },
    cmos: {
      score: "HIGH",
      badgeClass: "bg-ok/10 text-ok border-ok/30",
      costEn: "$3 - $5 (CR2032 Battery)",
      costMs: "RM 5 - RM 12 (Bateri CR2032)",
      verdictEn: "100% Worth Fixing! Cheap battery replacement restores full stability.",
      verdictMs: "100% Sangat Berbaloi! Tukar bateri leper RM5 pulihkan jam dan kestabilan PC.",
      adviceEn: "A CR2032 battery can be bought at any supermarket or pharmacy and installed in 2 minutes.",
      adviceMs: "Bateri CR2032 boleh dibeli di mana-mana kedai jam atau pasar raya dan ditukar dalam 2 minit.",
    },
    psu: {
      score: pcAge === "old" ? "MEDIUM" : "HIGH",
      badgeClass: pcAge === "old" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-ok/10 text-ok border-ok/30",
      costEn: "$45 - $85 (New Power Supply)",
      costMs: "RM 160 - RM 280 (Power Supply Baru)",
      verdictEn: pcAge === "old" ? "Consider carefully. PSU replacement is viable, but system platform is aged." : "Highly Recommended. A quality modern power supply protects your entire PC.",
      verdictMs: pcAge === "old" ? "Pertimbangkan umur PC. Boleh ganti PSU, tapi platform dah lama." : "Sangat Disyorkan. PSU berkualiti melindungi semua komponen lain daripada lonjakan elektrik.",
      adviceEn: "Always buy a tier-C or higher 80+ Bronze/Gold rated unit. Never buy unbranded cheap power supplies.",
      adviceMs: "Pilih jenama diyakini dengan sijil 80+ Bronze/Gold. Elakkan PSU murah tiada jenama.",
    },
    gpu: {
      score: pcAge === "old" ? "LOW" : "MEDIUM",
      badgeClass: pcAge === "old" ? "bg-critical/10 text-critical border-critical/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30",
      costEn: "$150 - $400+ (New Graphics Card)",
      costMs: "RM 600 - RM 1,600+ (Kad Grafik Baru)",
      verdictEn: pcAge === "old" ? "Better to Upgrade Entire System. Putting expensive parts into an obsolete PC wastes money." : "Worth Replacing if CPU and motherboard are modern.",
      verdictMs: pcAge === "old" ? "Lebih Berbaloi Beli PC Baru. Beli alat mahal untuk komputer usang membazir wang." : "Berbaloi Diganti jika processor dan motherboard masih model baru.",
      adviceEn: "Before declaring a GPU dead, test on another PC or test with integrated CPU graphics first.",
      adviceMs: "Sebelum sahkan GPU rosak, uji pada PC lain atau cuba cucuk monitor ke port motherboard dulu.",
    },
  }[issueType];

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="feasibility-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
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
          aria-labelledby="feasibility-modal-title"
          className="glass-element glass-adaptive relative w-full max-w-xl p-6 sm:p-8 z-10 space-y-5 max-h-[90vh] flex flex-col overflow-hidden text-[13px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:text-dark-accent">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 id="feasibility-modal-title" className="text-lg font-bold text-ink dark:text-dark-ink">
                  {isMs ? "Kalkulator Kelayakan & Kos Baiki" : "Is It Worth Fixing? Repair Feasibility"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Ketahui sama ada masalah anda berbaloi dibaiki atau lebih jimat naik taraf."
                    : "Determine whether repairing your PC makes financial sense or if replacing is smarter."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Step 1: PC Age */}
            <div className="space-y-1.5">
              <label className="font-bold text-ink dark:text-dark-ink block">
                {isMs ? "1. Berapa umur komputer anda?" : "1. How old is your computer?"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "new", labelEn: "< 3 Years", labelMs: "< 3 Tahun" },
                  { id: "mid", labelEn: "3 - 6 Years", labelMs: "3 - 6 Tahun" },
                  { id: "old", labelEn: "7+ Years", labelMs: "7+ Tahun" },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setPcAge(a.id as any)}
                    className={`min-h-[44px] py-2.5 px-3 flex items-center justify-center rounded-xl border text-center font-semibold transition-all ${
                      pcAge === a.id
                        ? "border-accent ring-2 ring-accent/20 bg-accent-soft/30 dark:bg-dark-accent/15 text-accent dark:text-dark-accent"
                        : "border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 hover:bg-subtle text-ink-secondary dark:text-dark-ink-secondary"
                    }`}
                  >
                    {isMs ? a.labelMs : a.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Problem Scope */}
            <div className="space-y-1.5">
              <label className="font-bold text-ink dark:text-dark-ink block">
                {isMs ? "2. Apakah jenis komponen atau masalah?" : "2. Suspected problem category:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "free", labelEn: "Driver / Cable / Windows", labelMs: "Driver / Kabel / Windows" },
                  { id: "cmos", labelEn: "Date Resets / CMOS Battery", labelMs: "Tarikh Reset / Bateri CMOS" },
                  { id: "psu", labelEn: "Dead Power Supply (PSU)", labelMs: "Power Supply Padam (PSU)" },
                  { id: "gpu", labelEn: "Graphics Card / Motherboard", labelMs: "Kad Grafik / Motherboard" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIssueType(t.id as any)}
                    className={`min-h-[44px] p-2.5 flex items-center rounded-xl border text-left font-semibold transition-all ${
                      issueType === t.id
                        ? "border-accent ring-2 ring-accent/20 bg-accent-soft/30 dark:bg-dark-accent/15 text-accent dark:text-dark-accent"
                        : "border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 hover:bg-subtle text-ink-secondary dark:text-dark-ink-secondary"
                    }`}
                  >
                    {isMs ? t.labelMs : t.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Verdict Card */}
            <div className="rounded-2xl border border-line dark:border-dark-line bg-white/90 dark:bg-dark-card/90 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px] text-ink dark:text-dark-ink">
                  {isMs ? "Keputusan Penilaian:" : "Feasibility Verdict:"}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${evaluation.badgeClass}`}>
                  {evaluation.score} FEASIBILITY
                </span>
              </div>

              <div className="flex items-center gap-2 text-ink dark:text-dark-ink font-semibold">
                <DollarSign className="h-4 w-4 text-accent shrink-0" />
                <span>{isMs ? "Anggaran Kos: " : "Estimated Cost: "}</span>
                <span className="text-accent font-bold">{isMs ? evaluation.costMs : evaluation.costEn}</span>
              </div>

              <p className="font-medium text-ink dark:text-dark-ink leading-relaxed">
                {isMs ? evaluation.verdictMs : evaluation.verdictEn}
              </p>

              <div className="p-3 rounded-xl bg-subtle/60 dark:bg-dark-subtle/60 text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                <strong>{isMs ? "Nasihat Technician: " : "Tech Advice: "}</strong>
                {isMs ? evaluation.adviceMs : evaluation.adviceEn}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-line dark:border-dark-line flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-pill bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all flex items-center justify-center"
            >
              {isMs ? "Tutup" : "Done"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}

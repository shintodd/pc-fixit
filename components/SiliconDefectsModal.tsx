"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Search, AlertOctagon, CheckCircle2, ShieldAlert, ChevronRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import defectsData from "@/data/research/silicon_defects.json";

export default function SiliconDefectsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDefect, setActiveDefect] = useState<any>(defectsData[0]);

  const isMs = language === "ms";

  const categories = ["ALL", "CPU", "GPU", "STORAGE", "NETWORK", "PSU"];

  const filteredDefects = defectsData.filter((d) => {
    const matchesCat = selectedCategory === "ALL" || d.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.component.toLowerCase().includes(q) ||
      d.flawNameEn.toLowerCase().includes(q) ||
      d.flawNameMs.toLowerCase().includes(q) ||
      d.symptomsEn.toLowerCase().includes(q) ||
      d.symptomsMs.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-dark-card border border-line dark:border-dark-line shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-[16px] text-ink dark:text-dark-ink">
                  {isMs ? "Daftar Kecacatan Silikon & Isu Pengeluar" : "Known Silicon Defects & Recall Matrix"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Kerosakan fizikal terkenal mengikut model (Intel 13/14th Gen, 12VHPWR, Samsung 980 Pro, AM5 SoC)."
                    : "Verified architectural hardware defects and manufacturer recalls with official remediations."}
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

          {/* Search & Category Filter Bar */}
          <div className="p-4 border-b border-line dark:border-dark-line bg-subtle/30 dark:bg-dark-subtle/30 space-y-2.5 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMs ? "Cari model (cth: Intel 14900K, 4090, Samsung 980, AM5)..." : "Search component (e.g. 13900K, 4090, Samsung 980, AM5)..."}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-line dark:border-dark-line text-[13px] text-ink dark:text-dark-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-accent text-white shadow-xs"
                      : "bg-white dark:bg-dark-card border border-line dark:border-dark-line text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content: 2-Column on Desktop */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            {/* List Column */}
            <div className="md:col-span-5 border-r border-line dark:border-dark-line overflow-y-auto p-3 space-y-2 max-h-[240px] md:max-h-full">
              {filteredDefects.length === 0 ? (
                <div className="p-4 text-center text-ink-tertiary text-[12px]">
                  {isMs ? "Tiada rekod dijumpai." : "No defect records matched."}
                </div>
              ) : (
                filteredDefects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveDefect(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      activeDefect?.id === item.id
                        ? "bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-200 shadow-xs"
                        : "border-line dark:border-dark-line bg-white dark:bg-dark-card hover:bg-subtle dark:hover:bg-dark-subtle text-ink dark:text-dark-ink"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-subtle dark:bg-dark-subtle text-ink-secondary dark:text-dark-ink-secondary">
                        {item.category}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          item.severity === "CRITICAL"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <div className="font-bold text-[13px] leading-snug">
                      {item.component}
                    </div>
                    <div className="text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary truncate mt-0.5">
                      {isMs ? item.flawNameMs : item.flawNameEn}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Details Column */}
            <div className="md:col-span-7 overflow-y-auto p-5 space-y-4 text-[13px]">
              {activeDefect ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        {activeDefect.category} VULNERABILITY
                      </span>
                      <span className="text-[11px] font-bold text-ink-tertiary">
                        Verified Hardware Flaw
                      </span>
                    </div>
                    <h3 className="text-[18px] font-extrabold text-ink dark:text-dark-ink leading-tight">
                      {activeDefect.component}
                    </h3>
                    <p className="text-[14px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                      {isMs ? activeDefect.flawNameMs : activeDefect.flawNameEn}
                    </p>
                  </div>

                  {/* Symptoms Card */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[12px]">
                      <AlertOctagon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{isMs ? "Gejala / Tanda Kerosakan:" : "Observed Symptoms:"}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary pl-6">
                      {isMs ? activeDefect.symptomsMs : activeDefect.symptomsEn}
                    </p>
                  </div>

                  {/* Fix Steps Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[12px]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{isMs ? "Penyelesaian / Tindakan Pengeluar:" : "Official Remediation:"}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary pl-6">
                      {isMs ? activeDefect.fixMs : activeDefect.fixEn}
                    </p>
                  </div>

                  {/* Safety Warning */}
                  <div className="p-3.5 rounded-2xl bg-subtle/60 dark:bg-dark-subtle/60 border border-line dark:border-dark-line text-ink-tertiary dark:text-dark-ink-tertiary text-[11px] leading-relaxed">
                    {isMs
                      ? "Nota: Isu dalam senarai ini disahkan oleh forum pengeluar rasmi (Intel, AMD, NVIDIA, Samsung) dan memerlukan kemas kini firmware atau BIOS, bukan sekadar tetapan Windows biasa."
                      : "Note: These defects are officially acknowledged hardware flaws requiring vendor microcode, firmware, or hardware clearance, rather than standard Windows OS troubleshooting."}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-ink-tertiary">
                  {isMs ? "Pilih perkakasan untuk melihat maklumat." : "Select a hardware entry to view details."}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

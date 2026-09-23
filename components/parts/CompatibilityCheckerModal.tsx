"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Zap, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PartItem, BuildSelection, ComponentType } from "@/lib/parts/types";
import { CompatibilityReport } from "@/lib/parts/compatibility/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CompatibilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelection?: BuildSelection;
}

export default function CompatibilityCheckerModal({
  isOpen,
  onClose,
  initialSelection,
}: CompatibilityCheckerModalProps) {
  const { language } = useLanguage();
  const [allParts, setAllParts] = useState<PartItem[]>([]);
  const [selection, setSelection] = useState<BuildSelection>(initialSelection || {});
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (initialSelection) setSelection(initialSelection);
  }, [initialSelection]);

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

  // Load parts catalog on open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    fetch("/api/parts")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.parts) {
          setAllParts(data.parts);
        }
      })
      .catch((err) => console.error("Error loading parts for validator:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Validate whenever selection changes
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setValidating(true);

    fetch("/api/parts/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selection }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.report) {
          setReport(data.report);
        }
      })
      .catch((err) => console.error("Validation error:", err))
      .finally(() => {
        if (isMounted) setValidating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selection]);

  if (!isOpen) return null;

  const handleSelectSlot = (type: ComponentType, partId: string) => {
    const key = type.toLowerCase() as keyof BuildSelection;
    if (!partId) {
      setSelection((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const part = allParts.find((p) => p.id === partId);
    setSelection((prev) => ({ ...prev, [key]: part || null }));
  };

  const getFilteredOptions = (type: ComponentType) => {
    return allParts.filter((p) => p.type === type);
  };

  const slots: { type: ComponentType; label: string }[] = [
    { type: "CPU", label: "Processor (CPU)" },
    { type: "MOTHERBOARD", label: "Motherboard" },
    { type: "RAM", label: "Memory (RAM)" },
    { type: "GPU", label: "Graphics Card (GPU)" },
    { type: "STORAGE", label: "NVMe Storage" },
    { type: "PSU", label: "Power Supply Unit (PSU)" },
    { type: "CASE", label: "Chassis / Case" },
    { type: "COOLER", label: "CPU Cooler" },
  ];

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
          aria-labelledby="compat-modal-title"
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[18px] bg-canvas border border-line shadow-2xl overflow-hidden dark:bg-dark-surface dark:border-dark-line"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="compat-modal-title" className="text-lg font-semibold text-ink dark:text-white">
                  Hardware Compatibility Validator
                </h2>
                <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                  Deterministic verification across 10 physical clearances, electrical ratings, and socket rules
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted-80 hover:bg-subtle hover:text-ink transition-colors dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close compatibility validator"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Component Selectors (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted">
                  Selected Build Components
                </h3>
                <button
                  type="button"
                  onClick={() => setSelection({})}
                  className="text-xs text-accent hover:underline dark:text-dark-accent"
                >
                  Clear Selection
                </button>
              </div>

              {loading ? (
                <div className="space-y-3 py-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-subtle dark:bg-dark-subtle rounded-[10px] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((s) => {
                    const key = s.type.toLowerCase() as keyof BuildSelection;
                    const selectedItem = selection[key];
                    const options = getFilteredOptions(s.type);

                    return (
                      <div key={s.type} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-[12px] border border-line bg-canvas-parchment/30 dark:border-dark-line dark:bg-dark-subtle/20">
                        <label htmlFor={`slot-${s.type}`} className="text-xs font-medium text-ink dark:text-white min-w-[130px]">
                          {s.label}
                        </label>
                        <select
                          id={`slot-${s.type}`}
                          value={selectedItem?.id || ""}
                          onChange={(e) => handleSelectSlot(s.type, e.target.value)}
                          className="flex-1 text-xs px-3 py-2 rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <option value="">(None selected)</option>
                          {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.brand} {opt.model} - RM{opt.bestPriceMyr}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Real-Time Report (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted flex items-center justify-between">
                <span>Validation Results</span>
                {validating && <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />}
              </h3>

              {report && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-[14px] border flex items-center gap-3.5 ${
                      report.status === "PASS"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        : report.status === "WARN"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    {report.status === "PASS" ? (
                      <CheckCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
                    ) : report.status === "WARN" ? (
                      <AlertTriangle className="h-6 w-6 shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        {report.status === "PASS"
                          ? "100% Compatible Build"
                          : report.status === "WARN"
                          ? "Compatibility Warning"
                          : "Critical Incompatibility Detected"}
                      </p>
                      <p className="text-xs opacity-90 mt-0.5">
                        {report.status === "PASS"
                          ? "All physical clearances, electrical ratings, and socket types verify successfully."
                          : "Review the issues below before purchasing parts."}
                      </p>
                    </div>
                  </div>

                  {/* Power Draw Breakdown */}
                  <div className="p-4 rounded-[14px] border border-line bg-canvas-parchment/50 dark:border-dark-line dark:bg-dark-subtle/30 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink dark:text-white flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> Electrical Power Analysis
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-ink-muted-80 dark:text-dark-muted block">System Estimated Draw</span>
                        <span className="font-bold text-base text-ink dark:text-white">{report.estimatedWattage}W</span>
                      </div>
                      <div>
                        <span className="text-ink-muted-80 dark:text-dark-muted block">Recommended PSU Rating</span>
                        <span className="font-bold text-base text-accent dark:text-dark-accent">
                          {report.recommendedPsuWattage}W+
                        </span>
                        <span className="text-[10px] text-ink-muted-80 dark:text-dark-muted block">(+33% transient buffer)</span>
                      </div>
                    </div>
                  </div>

                  {/* Checks List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {report.checks.map((chk, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-[12px] border text-xs space-y-1 ${
                          chk.passed
                            ? "border-line/60 bg-canvas dark:border-dark-line/40 dark:bg-dark-subtle/20"
                            : chk.level === "CRITICAL"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {chk.passed ? (
                            <span className="text-emerald-500 font-bold">✓</span>
                          ) : chk.level === "CRITICAL" ? (
                            <span className="text-rose-500 font-bold">✗</span>
                          ) : (
                            <span className="text-amber-500 font-bold">!</span>
                          )}
                          <span className="font-semibold text-ink dark:text-white">{chk.ruleId}</span>
                        </div>
                        <p className="text-[11px] text-ink-muted-80 dark:text-dark-muted pl-4">
                          {language === "ms" ? chk.messageMs : chk.messageEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50 text-xs">
            <span className="text-ink-muted-80 dark:text-dark-muted">
              pcfix rules engine - 10 physical and electrical clearances verified
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

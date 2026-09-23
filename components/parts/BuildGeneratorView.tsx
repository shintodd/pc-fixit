"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Gamepad2,
  Briefcase,
  Tv,
  Coins,
  ShieldCheck,
  Zap,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BuildSelection, ComponentType, MarketPreference, UseCase } from "@/lib/parts/types";
import { BuildGeneratorResult } from "@/lib/parts/build-generator/types";
import CompatibilityCheckerModal from "@/components/parts/CompatibilityCheckerModal";
import UsedInspectionGuideModal from "@/components/parts/UsedInspectionGuideModal";
import InstallationGuideModal from "@/components/parts/InstallationGuideModal";

interface BuildGeneratorViewProps {
  initialBudget?: number;
  initialUseCase?: UseCase;
}

export default function BuildGeneratorView({
  initialBudget = 3500,
  initialUseCase = "gaming",
}: BuildGeneratorViewProps) {
  const [budget, setBudget] = useState<number>(initialBudget);
  const [useCase, setUseCase] = useState<UseCase>(initialUseCase);
  const [marketPreference, setMarketPreference] = useState<MarketPreference>("hybrid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuildGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Modals
  const [showCompatModal, setShowCompatModal] = useState(false);
  const [showUsedGuide, setShowUsedGuide] = useState(false);
  const [selectedGuideType, setSelectedGuideType] = useState<ComponentType | null>(null);

  const presetBudgets = [
    { label: "Entry", amount: 1800 },
    { label: "1080p Value", amount: 2500 },
    { label: "Solid Gaming", amount: 3500 },
    { label: "1440p High FPS", amount: 5000 },
    { label: "4K Tier", amount: 8000 },
    { label: "Workstation", amount: 12000 },
  ];

  const handleGenerate = async (targetBudget = budget, targetCase = useCase, targetPref = marketPreference) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parts/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetMyr: targetBudget,
          useCase: targetCase,
          marketPreference: targetPref,
        }),
      });

      const data = await res.json();
      if (data.success && data.build) {
        setResult(data.build);
      } else {
        setError(data.error || "Failed to generate build recommendation.");
      }
    } catch (err: any) {
      setError(err.message || "Network error generating build.");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    handleGenerate(initialBudget, initialUseCase, "hybrid");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyBuild = () => {
    if (!result) return;
    const partsList = [
      result.selection.cpu ? `CPU: ${result.selection.cpu.name} (RM${result.selection.cpu.bestPriceMyr})` : "",
      result.selection.motherboard ? `Motherboard: ${result.selection.motherboard.name} (RM${result.selection.motherboard.bestPriceMyr})` : "",
      result.selection.ram ? `RAM: ${result.selection.ram.name} (RM${result.selection.ram.bestPriceMyr})` : "",
      result.selection.gpu ? `GPU: ${result.selection.gpu.name} (RM${result.selection.gpu.bestPriceMyr})` : "",
      result.selection.storage ? `Storage: ${result.selection.storage.name} (RM${result.selection.storage.bestPriceMyr})` : "",
      result.selection.psu ? `PSU: ${result.selection.psu.name} (RM${result.selection.psu.bestPriceMyr})` : "",
      result.selection.case ? `Case: ${result.selection.case.name} (RM${result.selection.case.bestPriceMyr})` : "",
      result.selection.cooler ? `Cooler: ${result.selection.cooler.name} (RM${result.selection.cooler.bestPriceMyr})` : "Cooler: AMD/Intel Bundled Stock Cooler",
    ]
      .filter(Boolean)
      .join("\n");

    const text = `pcfix Smart Build Recommendation (${result.useCase.toUpperCase()} - RM${result.totalPriceMyr})\n` +
      `Market Strategy: ${result.marketPreference.toUpperCase()}\n\n` +
      partsList +
      `\n\nTotal Cost: RM${result.totalPriceMyr} | Estimated Power: ${result.compatibility.estimatedWattage}W (Rec: ${result.compatibility.recommendedPsuWattage}W)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useCases: { id: UseCase; label: string; icon: any; desc: string }[] = [
    { id: "gaming", label: "Gaming", icon: Gamepad2, desc: "Maximizes GPU performance and frame rates" },
    { id: "workstation", label: "Workstation", icon: Briefcase, desc: "Prioritizes multi-core CPU & RAM capacity" },
    { id: "streaming", label: "Streaming", icon: Tv, desc: "Balanced encoding power and graphics" },
    { id: "budget", label: "Budget", icon: Coins, desc: "Strict price-to-performance optimization" },
  ];

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="p-6 rounded-[18px] bg-canvas border border-line shadow-sm dark:bg-dark-surface dark:border-dark-line space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent dark:text-dark-accent" aria-hidden="true" />
              Dynamic Smart Build Generator
            </h2>
            <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
              Dynamically rebalances component budgets based on live Malaysian market stock and second-hand value
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {presetBudgets.map((pb) => (
              <button
                key={pb.amount}
                type="button"
                onClick={() => {
                  setBudget(pb.amount);
                  handleGenerate(pb.amount, useCase, marketPreference);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  budget === pb.amount
                    ? "bg-accent text-white border-accent dark:bg-dark-accent dark:border-dark-accent"
                    : "border-line bg-canvas-parchment/60 hover:bg-subtle text-ink dark:border-dark-line dark:bg-dark-subtle/50 dark:text-white"
                }`}
              >
                {pb.label} (RM{pb.amount.toLocaleString()})
              </button>
            ))}
          </div>
        </div>

        {/* Budget Input Slider & Direct Number */}
        <div className="space-y-3 p-4 rounded-[14px] bg-canvas-parchment/40 border border-line dark:bg-dark-subtle/20 dark:border-dark-line">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-slider" className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted">
              Target Budget (Malaysian Ringgit)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink dark:text-white">RM</span>
              <input
                id="budget-input"
                name="budgetValue"
                type="number"
                min={1500}
                max={20000}
                step={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                onBlur={() => handleGenerate(budget, useCase, marketPreference)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate(budget, useCase, marketPreference);
                }}
                aria-label="Target Budget in Malaysian Ringgit"
                className="w-24 text-right px-2.5 py-1 text-sm font-bold rounded-lg border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>

          <input
            id="budget-slider"
            name="budgetSlider"
            type="range"
            min={1500}
            max={15000}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            onPointerUp={() => handleGenerate(budget, useCase, marketPreference)}
            onTouchEnd={() => handleGenerate(budget, useCase, marketPreference)}
            onKeyUp={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                handleGenerate(budget, useCase, marketPreference);
              }
            }}
            aria-label="Target Budget Slider"
            className="w-full h-2 bg-subtle dark:bg-dark-subtle rounded-lg appearance-none cursor-pointer accent-accent dark:accent-dark-accent"
          />
          <div className="flex justify-between text-[11px] text-ink-muted-80 dark:text-dark-muted">
            <span>RM1,500 (Minimum)</span>
            <span>RM7,500</span>
            <span>RM15,000 (Enthusiast)</span>
          </div>
        </div>

        {/* Use Case & Market Preference Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Use Case */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted block">
              Workload & Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {useCases.map((uc) => {
                const Icon = uc.icon;
                const isSelected = useCase === uc.id;
                return (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => {
                      setUseCase(uc.id);
                      handleGenerate(budget, uc.id, marketPreference);
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-[12px] border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "border-accent bg-accent/5 dark:border-dark-accent dark:bg-dark-accent/10"
                        : "border-line bg-canvas hover:bg-subtle dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? "text-accent dark:text-dark-accent" : "text-ink-muted-80 dark:text-dark-muted"}`} />
                    <div>
                      <p className="text-xs font-bold text-ink dark:text-white">{uc.label}</p>
                      <p className="text-[10px] text-ink-muted-80 dark:text-dark-muted leading-tight mt-0.5">{uc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Preference */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted block">
                Market Sourcing Strategy
              </label>
              <button
                type="button"
                onClick={() => setShowUsedGuide(true)}
                className="text-[11px] text-accent hover:underline dark:text-dark-accent"
              >
                Inspection Guide
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: "hybrid",
                  title: "Smart Hybrid (Recommended)",
                  desc: "New PSU & SSD for safety + used GPU/CPU/RAM for peak value",
                  badge: "Best Value",
                },
                {
                  id: "new",
                  title: "100% Brand New",
                  desc: "Full retail manufacturer warranties from Shopee & Lazada",
                  badge: "Safest",
                },
                {
                  id: "used",
                  title: "Second-Hand Maximizer",
                  desc: "Pre-owned market across components to stretch small budgets",
                  badge: "Max FPS",
                },
              ].map((mp) => {
                const isSelected = marketPreference === mp.id;
                return (
                  <button
                    key={mp.id}
                    type="button"
                    onClick={() => {
                      setMarketPreference(mp.id as MarketPreference);
                      handleGenerate(budget, useCase, mp.id as MarketPreference);
                    }}
                    className={`flex items-center justify-between p-3 rounded-[12px] border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "border-accent bg-accent/5 dark:border-dark-accent dark:bg-dark-accent/10"
                        : "border-line bg-canvas hover:bg-subtle dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-ink dark:text-white">{mp.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                          {mp.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted-80 dark:text-dark-muted mt-0.5">{mp.desc}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-accent dark:text-dark-accent shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleGenerate(budget, useCase, marketPreference)}
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2 dark:bg-dark-accent dark:hover:bg-dark-accent-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {loading ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" aria-hidden="true" />
                Calculating Optimal Allocations...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Generate Value-Optimized Build (RM{budget.toLocaleString()})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Build Results View */}
      {error && (
        <div className="p-6 rounded-[18px] border border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs">
          <p className="font-semibold">Unable to generate build:</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Overview Dashboard Card */}
          <div className="p-6 rounded-[18px] bg-canvas border border-line shadow-sm dark:bg-dark-surface dark:border-dark-line space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line dark:border-dark-line">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent">
                  Build Summary
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h3 className="text-2xl font-bold text-ink dark:text-white">
                    RM{result.totalPriceMyr.toLocaleString()}
                  </h3>
                  <span className="text-xs text-ink-muted-80 dark:text-dark-muted">
                    Target Budget: RM{result.budgetMyr.toLocaleString()} ({result.remainingBudgetMyr >= 0 ? `RM${result.remainingBudgetMyr} saved` : `RM${Math.abs(result.remainingBudgetMyr)} over`})
                  </span>
                </div>
              </div>

              {/* Status & Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBuild}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-canvas text-xs font-medium text-ink hover:bg-subtle transition-colors dark:border-dark-line dark:bg-dark-surface dark:text-white dark:hover:bg-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Specs"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCompatModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-xs font-medium text-white hover:bg-accent-hover transition-colors dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verify Rules</span>
                </button>
              </div>
            </div>

            {/* Reallocation & Market Strategy Notes */}
            {result.reallocationNotes.length > 0 && (
              <div className="p-3.5 rounded-[14px] bg-canvas-parchment/60 border border-line dark:bg-dark-subtle/30 dark:border-dark-line text-xs space-y-1.5">
                <p className="font-semibold text-ink dark:text-white flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-accent dark:text-dark-accent" aria-hidden="true" />
                  Market Allocation Logic
                </p>
                <ul className="space-y-1 text-ink-muted-80 dark:text-dark-muted pl-5 list-disc">
                  {result.reallocationNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-[12px] bg-canvas-parchment/30 border border-line dark:bg-dark-subtle/20 dark:border-dark-line">
                <span className="text-ink-muted-80 dark:text-dark-muted block">System Power</span>
                <span className="font-bold text-sm text-ink dark:text-white">
                  {result.compatibility.estimatedWattage}W (Rec. {result.compatibility.recommendedPsuWattage}W)
                </span>
              </div>
              <div className="p-3 rounded-[12px] bg-canvas-parchment/30 border border-line dark:bg-dark-subtle/20 dark:border-dark-line">
                <span className="text-ink-muted-80 dark:text-dark-muted block">Compatibility</span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Verified
                </span>
              </div>
              <div className="p-3 rounded-[12px] bg-canvas-parchment/30 border border-line dark:bg-dark-subtle/20 dark:border-dark-line">
                <span className="text-ink-muted-80 dark:text-dark-muted block">Value Score</span>
                <span className="font-bold text-sm text-accent dark:text-dark-accent">
                  {result.overallValueScore} / 100 PPI
                </span>
              </div>
              <div className="p-3 rounded-[12px] bg-canvas-parchment/30 border border-line dark:bg-dark-subtle/20 dark:border-dark-line">
                <span className="text-ink-muted-80 dark:text-dark-muted block">Market Strategy</span>
                <span className="font-bold text-sm uppercase text-ink dark:text-white">
                  {result.marketPreference}
                </span>
              </div>
            </div>
          </div>

          {/* 8-Part Breakdown Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted">
              Allocated Hardware Components
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.allocations.map((alloc) => {
                const item = (result.selection as any)[alloc.componentType.toLowerCase()];
                const isStockCooler = alloc.componentType === "COOLER" && !item;

                // Match exact retailer quote for this component
                const matchingQuote = item?.prices
                  ? (item.prices.find((q: any) =>
                      (alloc.condition === "new" ? q.condition === "new" : q.condition !== "new") &&
                      q.priceMyr === alloc.actualMyr
                    ) ||
                    item.prices
                      .filter((q: any) => alloc.condition === "new" ? q.condition === "new" : q.condition !== "new")
                      .sort((a: any, b: any) => a.priceMyr - b.priceMyr)[0] ||
                    item.prices[0])
                  : null;

                const retailerName = alloc.selectedRetailer || matchingQuote?.retailerName || "Malaysian Retailer";
                const productUrl = alloc.selectedProductUrl || matchingQuote?.productUrl || "#";
                const sellerLocation = alloc.sellerLocation || matchingQuote?.sellerLocation;

                return (
                  <div
                    key={alloc.componentType}
                    className="p-4 rounded-[16px] border border-line bg-canvas shadow-sm flex flex-col justify-between dark:border-dark-line dark:bg-dark-surface"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted">
                          {alloc.componentType}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {alloc.condition && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                alloc.condition === "new"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {alloc.condition === "new" ? "Brand New" : "Tested Used"}
                            </span>
                          )}
                          <span className="text-xs font-bold text-ink dark:text-white">
                            RM{alloc.actualMyr}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2">
                        {isStockCooler ? (
                          <div>
                            <p className="text-sm font-semibold text-ink dark:text-white">
                              AMD/Intel Bundled Thermal Solution
                            </p>
                            <p className="text-xs text-ink-muted-80 dark:text-dark-muted mt-0.5">
                              Free stock boxed cooler included with processor - zero added cost
                            </p>
                          </div>
                        ) : item ? (
                          <div>
                            <p className="text-sm font-semibold text-ink dark:text-white line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-ink-muted-80 dark:text-dark-muted mt-0.5">
                              Quote source: <span className="font-semibold text-ink dark:text-white">{retailerName}</span>
                              {sellerLocation ? ` (${sellerLocation})` : ""}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-ink-muted-80 dark:text-dark-muted italic">
                            Optional / Integrated
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons per component */}
                    {!isStockCooler && item && (
                      <div className="mt-4 pt-3 border-t border-line dark:border-dark-line flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedGuideType(alloc.componentType)}
                          className="flex items-center gap-1 text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white transition-colors"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          <span>Install Guide</span>
                        </button>

                        <a
                          href={productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent font-medium hover:underline dark:text-dark-accent"
                        >
                          <span>Buy on {retailerName} (RM{alloc.actualMyr})</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CompatibilityCheckerModal
        isOpen={showCompatModal}
        onClose={() => setShowCompatModal(false)}
        initialSelection={result?.selection}
      />
      <UsedInspectionGuideModal
        isOpen={showUsedGuide}
        onClose={() => setShowUsedGuide(false)}
      />
      <InstallationGuideModal
        isOpen={Boolean(selectedGuideType)}
        onClose={() => setSelectedGuideType(null)}
        initialType={selectedGuideType || "CPU"}
      />
    </div>
  );
}

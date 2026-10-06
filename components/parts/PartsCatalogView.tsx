"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  History,
  Bell,
  Wrench,
  ShieldAlert,
  ChevronDown,
  Tag,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Zap,
  TrendingDown,
  Target,
  ArrowRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PartItem, ComponentType } from "@/lib/parts/types";
import { checkCandidateCompatibility } from "@/lib/parts/compatibility/checker";
import PriceHistoryModal from "@/components/parts/PriceHistoryModal";
import PriceAlertModal from "@/components/parts/PriceAlertModal";
import InstallationGuideModal from "@/components/parts/InstallationGuideModal";
import UsedInspectionGuideModal from "@/components/parts/UsedInspectionGuideModal";

interface PartsCatalogViewProps {
  initialType?: ComponentType;
  initialCondition?: "all" | "new" | "used";
}

export default function PartsCatalogView({
  initialType,
  initialCondition = "all",
}: PartsCatalogViewProps) {
  const [parts, setParts] = useState<PartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Search
  const [selectedType, setSelectedType] = useState<ComponentType | "ALL">(initialType || "ALL");
  const [condition, setCondition] = useState<"all" | "new" | "used">(initialCondition);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "compat" | "price-asc" | "price-desc" | "performance" | "tier">("value");

  // Compatibility Testing Anchor
  const [anchorPart, setAnchorPart] = useState<PartItem | null>(null);
  const [compatFilter, setCompatFilter] = useState<"all" | "compatible" | "incompatible">("all");

  // Modals and UI State
  const [historyPart, setHistoryPart] = useState<PartItem | null>(null);
  const [alertPart, setAlertPart] = useState<PartItem | null>(null);
  const [guideType, setGuideType] = useState<ComponentType | null>(null);
  const [showUsedGuide, setShowUsedGuide] = useState(false);
  const [expandedProsCons, setExpandedProsCons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (selectedType !== "ALL") params.set("type", selectedType);
    if (condition !== "all") params.set("condition", condition);

    fetch(`/api/parts?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.parts) {
          setParts(data.parts);
        } else {
          setError(data.error || "Failed to load parts catalog.");
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Network error loading parts catalog.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedType, condition]);

  const toggleProsCons = (partId: string) => {
    setExpandedProsCons((prev) => ({ ...prev, [partId]: !prev[partId] }));
  };

  // Compatibility mapping for active anchor
  const compatibilityMap = useMemo(() => {
    const map = new Map<string, { isCompatible: boolean; conflictReason?: string }>();
    if (!anchorPart) return map;

    for (const part of parts) {
      if (part.id === anchorPart.id) {
        map.set(part.id, { isCompatible: true });
        continue;
      }
      if (part.type === anchorPart.type) {
        map.set(part.id, {
          isCompatible: true,
          conflictReason: `Alternative ${part.type} option to replace ${anchorPart.name}`,
        });
        continue;
      }

      const res = checkCandidateCompatibility(part, {
        [anchorPart.type.toLowerCase()]: anchorPart,
      });
      map.set(part.id, res);
    }

    return map;
  }, [anchorPart, parts]);

  // Client-side search, filtering and sorting
  const filteredAndSortedParts = useMemo(() => {
    let result = [...parts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          (p.opinion?.recommendationLabel && p.opinion.recommendationLabel.toLowerCase().includes(q)) ||
          (p.opinion?.upgradeAdvice && p.opinion.upgradeAdvice.toLowerCase().includes(q))
      );
    }

    // Compatibility filter against anchor
    if (anchorPart && compatFilter !== "all") {
      result = result.filter((p) => {
        const compat = compatibilityMap.get(p.id);
        if (!compat) return true;
        if (compatFilter === "compatible") return compat.isCompatible;
        if (compatFilter === "incompatible") return !compat.isCompatible;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      // If compat sorting selected or anchor active with compat sorting
      if (sortBy === "compat" && anchorPart) {
        const compatA = compatibilityMap.get(a.id)?.isCompatible ? 1 : 0;
        const compatB = compatibilityMap.get(b.id)?.isCompatible ? 1 : 0;
        if (compatA !== compatB) return compatB - compatA;
      }

      if (sortBy === "price-asc") {
        const pA = a.marketPricing?.fairTargetPriceMyr || a.bestPriceMyr;
        const pB = b.marketPricing?.fairTargetPriceMyr || b.bestPriceMyr;
        return pA - pB;
      }

      if (sortBy === "price-desc") {
        const pA = a.marketPricing?.fairTargetPriceMyr || a.bestPriceMyr;
        const pB = b.marketPricing?.fairTargetPriceMyr || b.bestPriceMyr;
        return pB - pA;
      }

      if (sortBy === "performance") {
        return b.benchmarkScore - a.benchmarkScore;
      }

      if (sortBy === "tier") {
        const tierWeights: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
        const tierA = tierWeights[a.opinion?.tierRanking || "C"] || 0;
        const tierB = tierWeights[b.opinion?.tierRanking || "C"] || 0;
        return tierB - tierA;
      }

      // Default: Value ranking (benchmarkScore / fairTargetPriceMyr)
      const fairA = a.marketPricing?.fairTargetPriceMyr || a.bestPriceMyr;
      const fairB = b.marketPricing?.fairTargetPriceMyr || b.bestPriceMyr;
      const valA = fairA > 0 ? a.benchmarkScore / fairA : 0;
      const valB = fairB > 0 ? b.benchmarkScore / fairB : 0;
      return valB - valA;
    });

    return result;
  }, [parts, searchQuery, anchorPart, compatFilter, sortBy, compatibilityMap]);

  // Counts for compatibility tabs
  const compatCounts = useMemo(() => {
    if (!anchorPart) return { compatible: 0, incompatible: 0 };
    let c = 0;
    let ic = 0;
    for (const p of parts) {
      const match = compatibilityMap.get(p.id);
      if (match?.isCompatible) c++;
      else if (match && !match.isCompatible) ic++;
    }
    return { compatible: c, incompatible: ic };
  }, [anchorPart, parts, compatibilityMap]);

  const categories: { type: ComponentType | "ALL"; label: string }[] = [
    { type: "ALL", label: "All Hardware" },
    { type: "CPU", label: "CPUs" },
    { type: "GPU", label: "GPUs" },
    { type: "MOTHERBOARD", label: "Motherboards" },
    { type: "RAM", label: "RAM Kits" },
    { type: "STORAGE", label: "Storage" },
    { type: "PSU", label: "Power Supplies" },
    { type: "CASE", label: "Chassis" },
    { type: "COOLER", label: "Cooling" },
  ];

  return (
    <div className="space-y-6">
      {/* Pre-Owned Market Inspection Advisory Banner */}
      <div className="p-4 rounded-[16px] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">
              Malaysian PC Hardware Valuation and Compatibility Index
            </p>
            <p className="text-ink-muted-80 dark:text-dark-muted">
              Real market values for new retail and pre-owned listings across Lowyat, Digital Mall, Carousell, and Mudah.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowUsedGuide(true)}
          className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-medium hover:bg-amber-500/30 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Pre-Owned Inspection Checklist
        </button>
      </div>

      {/* Compatibility Anchor Bar */}
      <div className="p-4 rounded-[18px] bg-canvas border border-line dark:bg-dark-surface dark:border-dark-line shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                Dynamic Compatibility Engine
              </h3>
              <p className="text-[11px] text-ink-muted-80 dark:text-dark-muted">
                {anchorPart
                  ? `Testing entire catalog against: ${anchorPart.name}`
                  : "Select any component to check compatibility across all parts"}
              </p>
            </div>
          </div>

          {/* Quick Anchor Dropdown or Clear */}
          <div className="flex items-center gap-2">
            {anchorPart ? (
              <button
                type="button"
                onClick={() => {
                  setAnchorPart(null);
                  setCompatFilter("all");
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Clear Baseline ({anchorPart.brand} {anchorPart.model})
              </button>
            ) : (
              <div className="text-xs text-ink-muted-80 dark:text-dark-muted">
                Click &quot;Test Compatibility&quot; on any card below
              </div>
            )}
          </div>
        </div>

        {/* Compatibility Segmented Filter when Anchor is Active */}
        {anchorPart && (
          <div className="pt-2 border-t border-line dark:border-dark-line flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex p-1 rounded-full bg-canvas-parchment dark:bg-dark-subtle border border-line dark:border-dark-line text-xs font-medium">
              <button
                type="button"
                onClick={() => setCompatFilter("all")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  compatFilter === "all"
                    ? "bg-ink text-white dark:bg-white dark:text-ink shadow-sm"
                    : "text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
                }`}
              >
                All Components
              </button>
              <button
                type="button"
                onClick={() => setCompatFilter("compatible")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  compatFilter === "compatible"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-700 dark:text-emerald-400 hover:underline"
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Compatible Only ({compatCounts.compatible})</span>
              </button>
              <button
                type="button"
                onClick={() => setCompatFilter("incompatible")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  compatFilter === "incompatible"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-700 dark:text-rose-400 hover:underline"
                }`}
              >
                <XCircle className="h-3 w-3" />
                <span>Incompatible ({compatCounts.incompatible})</span>
              </button>
            </div>

            <div className="text-[11px] text-ink-muted-80 dark:text-dark-muted">
              Active Socket/Platform: <span className="font-semibold text-ink dark:text-white">{(anchorPart.specs as any)?.socket || (anchorPart.specs as any)?.formFactor || anchorPart.type}</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Toolbar: Condition Tabs, Search and Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[18px] bg-canvas border border-line dark:bg-dark-surface dark:border-dark-line">
        {/* Market Condition Filter */}
        <div className="inline-flex p-1 rounded-full bg-canvas-parchment dark:bg-dark-subtle border border-line dark:border-dark-line text-xs font-medium">
          <button
            type="button"
            onClick={() => setCondition("all")}
            className={`px-4 py-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              condition === "all"
                ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                : "text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
            }`}
          >
            All Market Tiers
          </button>
          <button
            type="button"
            onClick={() => setCondition("new")}
            className={`px-4 py-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              condition === "new"
                ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                : "text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
            }`}
          >
            Brand New Retail
          </button>
          <button
            type="button"
            onClick={() => setCondition("used")}
            className={`px-4 py-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              condition === "used"
                ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                : "text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
            }`}
          >
            Second-Hand Market
          </button>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted-80 dark:text-dark-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search chip, model, or advice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Sort catalog by"
          >
            <option value="value">Best Value (PPI Index)</option>
            {anchorPart && <option value="compat">Compatibility First</option>}
            <option value="tier">Hardware Tier (S to D)</option>
            <option value="price-asc">Fair Price: Low to High</option>
            <option value="price-desc">Fair Price: High to Low</option>
            <option value="performance">Benchmark Score</option>
          </select>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
        {categories.map((cat) => {
          const isActive = selectedType === cat.type;
          return (
            <button
              key={cat.type}
              type="button"
              onClick={() => setSelectedType(cat.type)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? "bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white shadow-sm"
                  : "bg-canvas text-ink-muted-80 border-line hover:border-ink-muted-80 hover:text-ink dark:bg-dark-surface dark:text-dark-muted dark:border-dark-line dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Hardware Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-[18px] bg-subtle dark:bg-dark-subtle animate-pulse p-6" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-[18px] border border-line bg-canvas dark:border-dark-line dark:bg-dark-surface">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      ) : filteredAndSortedParts.length === 0 ? (
        <div className="p-12 text-center rounded-[18px] border border-line bg-canvas dark:border-dark-line dark:bg-dark-surface space-y-2">
          <p className="font-semibold text-ink dark:text-white">No components matched your search criteria.</p>
          <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
            Try resetting filters or adjusting compatibility settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedParts.map((part) => {
            const pricing = part.marketPricing;
            const opinion = part.opinion;
            const fairPrice = pricing?.fairTargetPriceMyr || part.bestPriceMyr;
            const isAnchor = anchorPart?.id === part.id;
            const compatCheck = anchorPart ? compatibilityMap.get(part.id) : null;
            const isCompatible = compatCheck ? compatCheck.isCompatible : true;

            const hasSavings =
              pricing?.newRange &&
              pricing?.usedRange &&
              pricing.newRange.min > pricing.usedRange.min;
            const savingsAmount = hasSavings
              ? pricing!.newRange!.min - pricing!.usedRange!.min
              : 0;

            const isProsConsExpanded = Boolean(expandedProsCons[part.id]);

            // Tier color scheme
            const tierBadgeColor =
              opinion?.tierRanking === "S"
                ? "bg-purple-600 text-white"
                : opinion?.tierRanking === "A"
                ? "bg-accent text-white dark:bg-dark-accent"
                : opinion?.tierRanking === "B"
                ? "bg-emerald-600 text-white"
                : opinion?.tierRanking === "C"
                ? "bg-amber-600 text-white"
                : "bg-zinc-600 text-white";

            return (
              <div
                key={part.id}
                className={`flex flex-col justify-between rounded-[18px] border bg-canvas p-5 shadow-sm transition-all dark:bg-dark-surface ${
                  isAnchor
                    ? "border-accent ring-2 ring-accent dark:border-dark-accent dark:ring-dark-accent shadow-md"
                    : compatCheck && !isCompatible
                    ? "border-rose-500/40 opacity-80 dark:border-rose-500/30"
                    : "border-line dark:border-dark-line hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Bar: Brand, Category, Tier Badge and Recommendation */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent">
                      {part.brand} - {part.type}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {opinion?.tierRanking && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tierBadgeColor}`}>
                          Tier {opinion.tierRanking}
                        </span>
                      )}
                      {opinion?.recommendationLabel && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {opinion.recommendationLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-ink dark:text-white mt-2 line-clamp-2 leading-snug">
                    {part.name}
                  </h3>

                  {/* Compatibility Status Banner (When Anchor is Selected) */}
                  {anchorPart && (
                    <div className="mt-2.5">
                      {isAnchor ? (
                        <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent dark:text-dark-accent text-[11px] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active Compatibility Reference</span>
                        </div>
                      ) : isCompatible ? (
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">100% Compatible with {anchorPart.name}</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-medium flex items-start gap-1.5">
                          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="leading-snug">{compatCheck?.conflictReason || "Platform or physical size conflict"}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Realistic Market Valuation Box */}
                  <div className="mt-3 p-3 rounded-[12px] bg-canvas-parchment dark:bg-dark-subtle/40 border border-line dark:border-dark-line space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-ink-muted-80 dark:text-dark-muted block">
                          Fair Market Target
                        </span>
                        <span className="text-xl font-bold text-ink dark:text-white">
                          RM{fairPrice}
                        </span>
                      </div>

                      {hasSavings && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          Save RM{savingsAmount} Pre-Owned
                        </span>
                      )}
                    </div>

                    {/* New vs Used Street Ranges */}
                    <div className="space-y-1 pt-1.5 border-t border-line/60 dark:border-dark-line/60 text-[11px]">
                      <div className="flex items-center justify-between text-ink-muted-80 dark:text-dark-muted">
                        <span>Brand New Retail Band:</span>
                        <span className="font-semibold text-ink dark:text-white">
                          {pricing?.newRange
                            ? `RM${pricing.newRange.min} to RM${pricing.newRange.max}`
                            : "Discontinued / Pre-Owned Only"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-ink-muted-80 dark:text-dark-muted">
                        <span>Second-Hand Street Band:</span>
                        <span className="font-semibold text-ink dark:text-white">
                          {pricing?.usedRange
                            ? `RM${pricing.usedRange.min} to RM${pricing.usedRange.max}`
                            : "Rare in pre-owned market"}
                        </span>
                      </div>
                    </div>

                    {/* Market Availability Status */}
                    {pricing?.availability && (
                      <div className="pt-1 text-[10px] text-ink-muted-80 dark:text-dark-muted flex items-center justify-between">
                        <span>Market Availability:</span>
                        <span className="capitalize font-medium text-ink dark:text-white">
                          {pricing.availability.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expert Opinion and Suggestion Card */}
                  {opinion && (
                    <div className="mt-3 p-3 rounded-[12px] bg-subtle/50 dark:bg-dark-subtle/20 border border-line dark:border-dark-line space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted block">
                          Expert Verdict
                        </span>
                        <p className="text-[11px] text-ink dark:text-white leading-relaxed mt-0.5">
                          {opinion.verdict}
                        </p>
                      </div>

                      {/* Upgrade & Pairing Suggestion */}
                      {opinion.upgradeAdvice && (
                        <div className="pt-1.5 border-t border-line/60 dark:border-dark-line/60">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent block">
                            Recommended Pairing
                          </span>
                          <p className="text-[11px] text-ink-muted-80 dark:text-dark-muted mt-0.5">
                            {opinion.upgradeAdvice}
                          </p>
                        </div>
                      )}

                      {/* Expandable Strengths and Considerations (Strictly NO circle dots) */}
                      {(opinion.pros.length > 0 || opinion.cons.length > 0) && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleProsCons(part.id)}
                            className="w-full flex items-center justify-between text-[11px] font-medium text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
                          >
                            <span>Key Strengths and Watch-Outs</span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                isProsConsExpanded ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          {isProsConsExpanded && (
                            <div className="mt-2 space-y-2 pt-1 border-t border-line/40 dark:border-dark-line/40">
                              {opinion.pros.length > 0 && (
                                <div className="space-y-1">
                                  {opinion.pros.map((pro, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                                      <Check className="h-3 w-3 mt-0.5 shrink-0" />
                                      <span>{pro}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {opinion.cons.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  {opinion.cons.map((con, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                      <span>{con}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specs Pill Summary */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {part.type === "CPU" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          Socket {(part.specs as any).socket}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).cores}C / {(part.specs as any).threads}T
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).tdpWattage}W TDP
                        </span>
                      </>
                    )}
                    {part.type === "GPU" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).vramGb}GB VRAM
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).lengthMm}mm Length
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          Rec. {(part.specs as any).recommendedPsuWattage}W PSU
                        </span>
                      </>
                    )}
                    {part.type === "MOTHERBOARD" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          Socket {(part.specs as any).socket}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).formFactor}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).ramType} Memory
                        </span>
                      </>
                    )}
                    {part.type === "RAM" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).capacityGb}GB ({(part.specs as any).moduleCount}x modules)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).ramType} {(part.specs as any).speedMhz}MHz
                        </span>
                      </>
                    )}
                    {part.type === "PSU" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).wattage}W
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).efficiencyRating}
                        </span>
                      </>
                    )}
                    {part.type === "STORAGE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                        {(part.specs as any).capacityGb}GB {(part.specs as any).interface}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar (Zero Outbound Store Links) */}
                <div className="mt-5 space-y-2 pt-3 border-t border-line dark:border-dark-line">
                  <div className="flex items-center justify-between gap-2">
                    {/* Tool utility buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setHistoryPart(part)}
                        title="View Price Valuation Trends"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas hover:bg-subtle transition-colors text-ink dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="View price valuation trends"
                      >
                        <History className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertPart(part)}
                        title="Set Target Fair Price Alert"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas hover:bg-subtle transition-colors text-ink dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="Set target fair price alert"
                      >
                        <Bell className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideType(part.type)}
                        title="Installation and Pinout Guide"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas hover:bg-subtle transition-colors text-ink dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="View installation guide"
                      >
                        <Wrench className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Compatibility Baseline Anchor Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isAnchor) {
                          setAnchorPart(null);
                          setCompatFilter("all");
                        } else {
                          setAnchorPart(part);
                          setSortBy("compat");
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isAnchor
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                          : "bg-accent text-white hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover shadow-sm"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{isAnchor ? "Release Baseline" : "Test Compatibility"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Modals */}
      <PriceHistoryModal
        isOpen={Boolean(historyPart)}
        onClose={() => setHistoryPart(null)}
        part={historyPart}
      />
      <PriceAlertModal
        isOpen={Boolean(alertPart)}
        onClose={() => setAlertPart(null)}
        part={alertPart}
      />
      <InstallationGuideModal
        isOpen={Boolean(guideType)}
        onClose={() => setGuideType(null)}
        initialType={guideType || "CPU"}
      />
      <UsedInspectionGuideModal
        isOpen={showUsedGuide}
        onClose={() => setShowUsedGuide(false)}
      />
    </div>
  );
}

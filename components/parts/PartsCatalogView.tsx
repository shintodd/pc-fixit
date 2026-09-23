"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ExternalLink,
  History,
  Bell,
  Wrench,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Tag,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PartItem, ComponentType, RetailerQuote } from "@/lib/parts/types";
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

  // Filters & Search
  const [selectedType, setSelectedType] = useState<ComponentType | "ALL">(initialType || "ALL");
  const [condition, setCondition] = useState<"all" | "new" | "used">(initialCondition);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "value" | "performance">("value");

  // Modals
  const [historyPart, setHistoryPart] = useState<PartItem | null>(null);
  const [alertPart, setAlertPart] = useState<PartItem | null>(null);
  const [guideType, setGuideType] = useState<ComponentType | null>(null);
  const [showUsedGuide, setShowUsedGuide] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

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

  // Client-side search and sorting
  const filteredAndSortedParts = useMemo(() => {
    let result = [...parts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.bestPriceMyr - b.bestPriceMyr;
      if (sortBy === "price-desc") return b.bestPriceMyr - a.bestPriceMyr;
      if (sortBy === "performance") return b.benchmarkScore - a.benchmarkScore;
      // Value ranking: (benchmarkScore / price)
      const valA = a.bestPriceMyr > 0 ? a.benchmarkScore / a.bestPriceMyr : 0;
      const valB = b.bestPriceMyr > 0 ? b.benchmarkScore / b.bestPriceMyr : 0;
      return valB - valA;
    });

    return result;
  }, [parts, searchQuery, sortBy]);

  const toggleQuotes = (partId: string) => {
    setExpandedQuotes((prev) => ({ ...prev, [partId]: !prev[partId] }));
  };

  const categories: { type: ComponentType | "ALL"; label: string }[] = [
    { type: "ALL", label: "All Components" },
    { type: "CPU", label: "CPUs" },
    { type: "GPU", label: "GPUs" },
    { type: "MOTHERBOARD", label: "Motherboards" },
    { type: "RAM", label: "RAM" },
    { type: "STORAGE", label: "Storage" },
    { type: "PSU", label: "Power Supplies" },
    { type: "CASE", label: "Cases" },
    { type: "COOLER", label: "Coolers" },
  ];

  return (
    <div className="space-y-6">
      {/* Second-Hand Inspection Advisory Banner */}
      <div className="p-4 rounded-[16px] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">
              Buying Pre-Owned Hardware in Malaysia?
            </p>
            <p className="text-ink-muted-80 dark:text-dark-muted">
              Check our checklist for FurMark GPU stress tests, AM4 socket pins, and CrystalDiskInfo checks.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowUsedGuide(true)}
          className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-medium hover:bg-amber-500/30 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          View Used Inspection Checklist
        </button>
      </div>

      {/* Primary Toolbar: Condition Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[18px] bg-canvas border border-line dark:bg-dark-surface dark:border-dark-line">
        {/* Market Condition Segmented Control */}
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
            All Listings
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
            Brand New Only
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

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted-80 dark:text-dark-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search components or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Sort parts by"
          >
            <option value="value">Best Value (PPI)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="performance">Benchmark Score</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
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

      {/* Grid of Parts Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-[18px] bg-subtle dark:bg-dark-subtle animate-pulse p-6" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-[18px] border border-line bg-canvas dark:border-dark-line dark:bg-dark-surface">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      ) : filteredAndSortedParts.length === 0 ? (
        <div className="p-12 text-center rounded-[18px] border border-line bg-canvas dark:border-dark-line dark:bg-dark-surface space-y-2">
          <p className="font-semibold text-ink dark:text-white">No components matched your search.</p>
          <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
            Try adjusting filters or switching between Brand New and Second-Hand tabs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedParts.map((part) => {
            const sortedQuotes = [...part.prices].sort((a, b) => a.priceMyr - b.priceMyr);
            const bestQuote =
              condition === "new"
                ? (sortedQuotes.filter((q) => q.condition === "new")[0] || sortedQuotes[0])
                : condition === "used"
                ? (sortedQuotes.filter((q) => q.condition !== "new")[0] || sortedQuotes[0])
                : sortedQuotes[0];

            const displayPrice =
              condition === "new"
                ? (part.bestNewPriceMyr || bestQuote?.priceMyr || part.bestPriceMyr)
                : condition === "used"
                ? (part.bestUsedPriceMyr || bestQuote?.priceMyr || part.bestPriceMyr)
                : part.bestPriceMyr;

            const hasSavings =
              part.bestNewPriceMyr &&
              part.bestUsedPriceMyr &&
              part.bestUsedPriceMyr < part.bestNewPriceMyr;
            const savingsMyr = hasSavings ? part.bestNewPriceMyr! - part.bestUsedPriceMyr! : 0;
            const isExpanded = Boolean(expandedQuotes[part.id]);

            return (
              <div
                key={part.id}
                className="flex flex-col justify-between rounded-[18px] border border-line bg-canvas p-5 shadow-sm hover:shadow-md transition-shadow dark:border-dark-line dark:bg-dark-surface"
              >
                <div>
                  {/* Top Bar: Brand, Type & Savings Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent">
                      {part.brand} - {part.type}
                    </span>
                    {hasSavings && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Save RM{savingsMyr} Used
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-ink dark:text-white mt-2 line-clamp-2 leading-snug">
                    {part.name}
                  </h3>

                  {/* Pricing Overview */}
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xl font-bold text-ink dark:text-white">
                        RM{displayPrice}
                      </span>
                      {bestQuote && (
                        <span className="text-xs text-ink-muted-80 dark:text-dark-muted">
                          on <span className="font-semibold text-ink dark:text-white">{bestQuote.retailerName}</span>
                          <span
                            className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              bestQuote.condition === "new"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {bestQuote.condition === "new" ? "New" : "Used"}
                          </span>
                        </span>
                      )}
                    </div>

                    {condition === "all" && part.bestNewPriceMyr && part.bestUsedPriceMyr && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted-80 dark:text-dark-muted">
                        <span>New: RM{part.bestNewPriceMyr}</span>
                        <span className="opacity-40">|</span>
                        <span>Used: RM{part.bestUsedPriceMyr}</span>
                      </div>
                    )}
                  </div>

                  {/* Specs Pill Summary */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {part.type === "CPU" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          Socket {(part.specs as any).socket}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).cores}C / {(part.specs as any).threads}T
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).tdpWattage}W TDP
                        </span>
                      </>
                    )}
                    {part.type === "GPU" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).vramGb}GB VRAM
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).lengthMm}mm Length
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          Rec. {(part.specs as any).recommendedPsuWattage}W PSU
                        </span>
                      </>
                    )}
                    {part.type === "MOTHERBOARD" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).socket}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).formFactor}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).ramType}
                        </span>
                      </>
                    )}
                    {part.type === "RAM" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).capacityGb}GB ({(part.specs as any).moduleCount}x modules)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).ramType} {(part.specs as any).speedMhz}MHz
                        </span>
                      </>
                    )}
                    {part.type === "PSU" && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).wattage}W
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                          {(part.specs as any).efficiencyRating}
                        </span>
                      </>
                    )}
                    {part.type === "STORAGE" && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-subtle dark:bg-dark-subtle text-ink dark:text-white">
                        {(part.specs as any).capacityGb}GB {(part.specs as any).interface}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Quotes & Actions */}
                <div className="mt-5 space-y-3 pt-3 border-t border-line dark:border-dark-line">
                  {/* Retailer Quotes Accordion Trigger */}
                  <button
                    type="button"
                    onClick={() => toggleQuotes(part.id)}
                    className="w-full flex items-center justify-between text-xs font-medium text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
                  >
                    <span>
                      {sortedQuotes.length} Seller Quote{sortedQuotes.length > 1 ? "s" : ""}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Expanded Quotes List */}
                  {isExpanded && (
                    <div className="space-y-2 pt-1 text-xs divide-y divide-line/60 dark:divide-dark-line/40">
                      {sortedQuotes.map((q, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ink dark:text-white">{q.retailerName}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  q.condition === "new"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                }`}
                              >
                                {q.condition === "new" ? "Brand New" : "Used"}
                              </span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                  Lowest
                                </span>
                              )}
                            </div>
                            {q.sellerLocation && (
                              <p className="text-[10px] text-ink-muted-80 dark:text-dark-muted">
                                {q.sellerLocation}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink dark:text-white">RM{q.priceMyr}</span>
                            <a
                              href={q.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle hover:bg-line transition-colors text-ink dark:bg-dark-subtle dark:hover:bg-dark-line dark:text-white"
                              aria-label={`Buy from ${q.retailerName} for RM${q.priceMyr}`}
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setHistoryPart(part)}
                        title="View Price Trends"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas hover:bg-subtle transition-colors text-ink dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="View price trends"
                      >
                        <History className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertPart(part)}
                        title="Set Price Alert"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas hover:bg-subtle transition-colors text-ink dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="Set price drop alert"
                      >
                        <Bell className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideType(part.type)}
                        title="Installation Guide"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas hover:bg-subtle transition-colors text-ink dark:border-dark-line dark:bg-dark-surface dark:hover:bg-dark-subtle dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="View installation guide"
                      >
                        <Wrench className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <a
                      href={bestQuote?.productUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors flex items-center gap-1 dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span>Buy on {bestQuote?.retailerName || "Store"} (RM{displayPrice})</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
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

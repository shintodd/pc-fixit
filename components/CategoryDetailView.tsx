"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  BookOpen,
  MessageSquare,
  Wrench,
  Layers,
  Power,
  MonitorX,
  Gauge,
  WifiOff,
  Flame,
  Cpu,
  HelpCircle,
  type LucideIcon,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type CategoryInfo, type Severity } from "@/lib/categories";
import { type IssueDetail } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import dynamic from "next/dynamic";

const HardwareVisualGuide = dynamic(() => import("@/components/HardwareVisualGuide"), { ssr: false });

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-critical/10 text-critical border-critical/20 dark:bg-critical/15 dark:text-critical",
  warn: "bg-warn/10 text-warn border-warn/20 dark:bg-warn/15 dark:text-warn",
  info: "bg-accent/10 text-accent border-accent/20 dark:bg-dark-accent/15 dark:text-dark-accent",
};

const CATEGORY_THEMES: Record<
  string,
  {
    icon: LucideIcon;
    glow: string;
    iconBg: string;
    badgeColor: string;
    accentColor: string;
    suggestedTags: string[];
  }
> = {
  "wont-boot": {
    icon: Power,
    glow: "border-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,0.12)]",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    accentColor: "text-rose-500",
    suggestedTags: ["No POST", "Black Screen", "DRAM LED", "Power Trip", "CMOS", "BIOS"],
  },
  "blue-screen": {
    icon: MonitorX,
    glow: "border-blue-500/30 shadow-[0_0_24px_rgba(59,130,246,0.12)]",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    accentColor: "text-blue-500",
    suggestedTags: ["IRQL_NOT_LESS", "WHEA Fault", "DPC Watchdog", "Kernel", "Memory", "Dump"],
  },
  "running-slow": {
    icon: Gauge,
    glow: "border-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    iconBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    accentColor: "text-amber-500",
    suggestedTags: ["100% Disk", "TiWorker", "0.79 GHz Lock", "SysMain", "RAM Leak", "Freeze"],
  },
  "no-internet": {
    icon: WifiOff,
    glow: "border-sky-500/30 shadow-[0_0_24px_rgba(14,165,233,0.12)]",
    iconBg: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    accentColor: "text-sky-500",
    suggestedTags: ["Gateway Dropped", "Wi-Fi 6E/7", "APIPA 169.254", "DNS Timeout", "Ethernet", "Winsock"],
  },
  overheating: {
    icon: Flame,
    glow: "border-orange-500/30 shadow-[0_0_24px_rgba(249,115,22,0.12)]",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    accentColor: "text-orange-500",
    suggestedTags: ["GDDR6X VRAM", "AIO Pump", "Thermal Paste", "Fan 100%", "Throttling", "Dust"],
  },
  "driver-issues": {
    icon: Cpu,
    glow: "border-purple-500/30 shadow-[0_0_24px_rgba(168,85,247,0.12)]",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    accentColor: "text-purple-500",
    suggestedTags: ["Code 43", "Code 10", "DDU Clean", "Realtek", "NVIDIA", "AMD Adrenalin"],
  },
};

interface CategoryDetailViewProps {
  category: CategoryInfo;
  issues: IssueDetail[];
}

export default function CategoryDetailView({ category, issues }: CategoryDetailViewProps) {
  const { t, language } = useLanguage();
  const isMs = language === "ms";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const theme = CATEGORY_THEMES[category.slug] || {
    icon: HelpCircle,
    glow: "border-accent/30 shadow-xs",
    iconBg: "bg-accent/10 text-accent",
    badgeColor: "bg-accent/10 text-accent border-accent/20",
    accentColor: "text-accent",
    suggestedTags: ["Hardware", "Diagnostic"],
  };

  const IconComponent = theme.icon;

  // Filter issues based on search query and selected symptom tag
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.summary.toLowerCase().includes(q) ||
        issue.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        issue.slug.toLowerCase().includes(q);

      const matchesTag =
        !selectedTag ||
        issue.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
        issue.summary.toLowerCase().includes(selectedTag.toLowerCase()) ||
        issue.symptoms.some((s) => s.toLowerCase().includes(selectedTag.toLowerCase()));

      return matchesQuery && matchesTag;
    });
  }, [issues, searchQuery, selectedTag]);

  return (
    <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-[13px] text-ink-secondary dark:text-dark-ink-secondary">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-ink dark:hover:text-dark-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{isMs ? "Utama" : "Home"}</span>
        </Link>
        <span>/</span>
        <Link
          href="/#categories"
          className="hover:text-ink dark:hover:text-dark-ink transition-colors"
        >
          {isMs ? "Koleksi Panduan" : "Diagnostic Library"}
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink dark:text-dark-ink">{category.title}</span>
      </div>

      {/* Category Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border ${theme.glow} bg-white/95 dark:bg-dark-card/95 p-6 sm:p-10 shadow-card dark:shadow-card-dark backdrop-blur-md`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.badgeColor}`}>
                <Layers className="h-3.5 w-3.5" />
                <span>{isMs ? "Kategori Masalah" : "Hardware Category"}</span>
              </span>

              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${SEVERITY_STYLE[category.severity]}`}>
                {category.severity === "critical"
                  ? (isMs ? "Masalah Kritikal" : "Critical Fault")
                  : category.severity === "warn"
                  ? (isMs ? "Kerap Berlaku" : "High Frequency")
                  : (isMs ? "Hardware & Driver" : "Hardware & Driver")}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-subtle dark:bg-dark-subtle px-3 py-1 text-[11px] font-medium text-ink-secondary dark:text-dark-ink-secondary border border-line/60 dark:border-dark-line">
                <BookOpen className="h-3.5 w-3.5 text-accent" />
                <span>
                  {isMs
                    ? `${issues.length} Panduan Penyelesaian`
                    : `${issues.length} Step-by-Step Resolution Guides`}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-xs ${theme.iconBg}`}>
                <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-dark-ink">
                {category.title}
              </h1>
            </div>

            <p className="text-base sm:text-lg text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href={`/troubleshoot?topic=${category.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-[14px] font-semibold text-white shadow-sm shadow-accent/20 hover:bg-accent-hover transition-all active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{isMs ? "Tanya Technician AI" : "Ask AI Technician"}</span>
            </Link>

            <Link
              href="/wizard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line dark:border-dark-line bg-subtle/80 dark:bg-dark-subtle/80 px-5 py-3 text-[14px] font-semibold text-ink dark:text-dark-ink hover:bg-subtle transition-all active:scale-95"
            >
              <Wrench className="h-4 w-4 text-accent" />
              <span>{isMs ? "Panduan Berpandu (Wizard)" : "Interactive Guided Fix"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Hardware Recognition Visual Guide Spotlight */}
      <div className="mt-8">
        <HardwareVisualGuide slug={category.slug} categorySlug={category.slug} />
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink dark:text-dark-ink">
              {isMs ? "Cari Panduan Penyelesaian" : "Explore Targeted Resolution Guides"}
            </h2>
            <p className="text-[13px] text-ink-secondary dark:text-dark-ink-secondary">
              {isMs
                ? `Menunjukkan ${filteredIssues.length} daripada ${issues.length} panduan yang diselidik.`
                : `Showing ${filteredIssues.length} of ${issues.length} researched guides in this category.`}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary dark:text-dark-ink-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMs ? "Tapis masalah (cth: black screen, RAM)..." : "Filter guides (e.g. black screen, RAM)..."}
              className="w-full rounded-xl border border-line dark:border-dark-line bg-white dark:bg-dark-card pl-10 pr-9 py-2 text-[13px] text-ink dark:text-dark-ink placeholder:text-ink-tertiary dark:placeholder:text-dark-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-ink-tertiary hover:text-ink dark:hover:text-dark-ink transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Suggested Symptom Filter Chips */}
        {theme.suggestedTags && theme.suggestedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" />
              <span>{isMs ? "Tapis Simptom:" : "Filter:"}</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`min-h-[36px] inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                selectedTag === null
                  ? "bg-accent text-white shadow-xs"
                  : "bg-subtle dark:bg-dark-subtle text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink border border-line/60 dark:border-dark-line"
              }`}
            >
              {isMs ? "Semua" : "All Guides"}
            </button>

            {theme.suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`min-h-[36px] inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedTag === tag
                    ? "bg-accent text-white shadow-xs"
                    : "bg-subtle dark:bg-dark-subtle text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink border border-line/60 dark:border-dark-line"
                }`}
              >
                {tag}
              </button>
            ))}

            {(searchQuery || selectedTag) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
                className="min-h-[36px] inline-flex items-center text-[11px] font-semibold text-critical hover:underline ml-2"
              >
                {isMs ? "Padam Penapis" : "Reset Filters"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guides Grid */}
      <div className="mt-6">
        {filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIssues.map((issue) => (
              <Link
                key={issue.slug}
                href={`/issues/${issue.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95 p-5 sm:p-6 shadow-xs hover:border-accent/40 hover:shadow-card transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                        SEVERITY_STYLE[issue.severity]
                      }`}
                    >
                      {issue.severity === "critical"
                        ? (isMs ? "Kritikal" : "Critical")
                        : issue.severity === "warn"
                        ? (isMs ? "Kerap" : "Common")
                        : (isMs ? "Ringan" : "Minor")}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
                      <Clock className="h-3 w-3 text-accent" />
                      <span>{issue.steps.length} {isMs ? "langkah" : "steps"}</span>
                    </span>
                  </div>

                  <h3 className="text-[16px] font-bold text-ink dark:text-dark-ink group-hover:text-accent transition-colors leading-snug">
                    {issue.title}
                  </h3>

                  <p className="text-[13px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed line-clamp-2">
                    {issue.summary}
                  </p>

                  {/* Symptom Preview Chips */}
                  {issue.symptoms && issue.symptoms.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {issue.symptoms.slice(0, 2).map((sym, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-accent mt-0.5" />
                          <span className="truncate">{sym}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-line/60 dark:border-dark-line/60 flex items-center justify-between text-[12px] font-semibold text-accent dark:text-dark-accent">
                  <span>{isMs ? "Buka Panduan Penuh" : "Open Step-by-Step Fix"}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line dark:border-dark-line bg-subtle/30 dark:bg-dark-subtle/30 p-10 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink dark:text-dark-ink">
              {isMs ? "Tiada Panduan Dijumpai" : "No Matching Guides Found"}
            </h3>
            <p className="text-[13px] text-ink-secondary dark:text-dark-ink-secondary max-w-md mx-auto">
              {isMs
                ? `Tiada panduan dalam kategori ini sepadan dengan carian "${searchQuery}". Cuba ubah carian atau tanya AI.`
                : `No guides in this category match your search for "${searchQuery}". Try a different keyword or ask our AI Technician directly.`}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
                className="rounded-xl border border-line dark:border-dark-line px-4 py-2 text-[13px] font-semibold text-ink dark:text-dark-ink hover:bg-subtle"
              >
                {isMs ? "Padam Penapis" : "Clear Filters"}
              </button>
              <Link
                href={`/troubleshoot?topic=${category.slug}`}
                className="rounded-xl bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover"
              >
                {isMs ? "Tanya AI Technician" : "Ask AI Technician"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

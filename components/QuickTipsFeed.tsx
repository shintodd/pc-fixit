"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Wrench,
  Sparkles,
  ShieldAlert,
  X,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TIPS_DATA, TIPS_CATEGORIES, type TipCategory, type TipItem } from "@/lib/tips-data";

export default function QuickTipsFeed({
  initialCategory = "all",
  showSearch = true,
  maxItems,
}: {
  initialCategory?: "all" | TipCategory;
  showSearch?: boolean;
  maxItems?: number;
}) {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<"all" | TipCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    let list = TIPS_DATA;

    if (selectedCategory !== "all") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const titleMatch = (language === "ms" ? item.titleMs : item.title).toLowerCase().includes(q);
        const summaryMatch = (language === "ms" ? item.summaryMs : item.summary).toLowerCase().includes(q);
        const cmdMatch = item.commandOrAction?.toLowerCase().includes(q);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(q));
        const badgeMatch = item.badge.toLowerCase().includes(q);
        return titleMatch || summaryMatch || cmdMatch || tagMatch || badgeMatch;
      });
    }

    if (maxItems && maxItems > 0) {
      return list.slice(0, maxItems);
    }

    return list;
  }, [selectedCategory, searchQuery, language, maxItems]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    } catch (_) {
      // Fallback
    }
  };

  const getCategoryIcon = (cat: TipCategory) => {
    switch (cat) {
      case "pc-tips":
        return Terminal;
      case "cool-tools":
        return Wrench;
      case "fun-stuff":
        return Sparkles;
      default:
        return Sparkles;
    }
  };

  const getTipIconImage = (item: TipItem): string => {
    if (item.iconImage) return item.iconImage;

    // Tool specific logos
    if (item.id === "tool-ctt-winutil") return "/images/tools/winutil.svg";
    if (item.id === "tool-oo-shutup10") return "/images/tools/oo-shutup10.svg";
    if (item.id === "tool-atlasos") return "/images/tools/atlasos.svg";
    if (item.id === "tool-ddu") return "/images/tools/ddu.svg";
    if (item.id === "tool-everything") return "/images/tools/everything.svg";
    if (item.id === "tool-wiztree") return "/images/tools/wiztree.svg";
    if (item.id === "tool-crystaldiskinfo") return "/images/tools/crystaldiskinfo.svg";
    if (item.id === "tool-hwinfo64") return "/images/tools/hwinfo64.svg";
    if (item.id === "tool-fancontrol") return "/images/tools/fancontrol.svg";
    if (item.id === "tool-latencymon") return "/images/tools/latencymon.svg";
    if (item.id === "tool-powertoys") return "/images/tools/powertoys.svg";
    if (item.id === "tool-rufus") return "/images/tools/rufus.svg";
    if (item.id === "tool-ventoy") return "/images/tools/ventoy.svg";
    if (item.id === "tool-eartrumpet") return "/images/tools/eartrumpet.svg";
    if (item.id === "tool-screentogif") return "/images/tools/screentogif.svg";
    if (item.id === "tool-bcuninstaller") return "/images/tools/bcuninstaller.svg";
    if (item.id === "tool-islc") return "/images/tools/islc.svg";
    if (item.id === "tool-rammap") return "/images/tools/rammap.svg";

    // PC Tips
    if (item.id === "tip-powercfg-battery") return "/images/tools/tip-battery.svg";
    if (item.id === "tip-wifi-password") return "/images/tools/tip-wifi.svg";
    if (item.id === "tip-dism-restorehealth" || item.id === "tip-sfc-scannow") return "/images/tools/tip-repair.svg";
    if (item.id === "tip-god-mode") return "/images/tools/tip-godmode.svg";
    if (item.category === "pc-tips") return "/images/tools/tip-terminal.svg";

    // Fun stuff
    return "/images/tools/fun-retro.svg";
  };

  return (
    <div className="w-full space-y-6">
      {/* Category Pills & Search Controls */}
      {showSearch && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll py-1">
            {TIPS_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === "all" ? TIPS_DATA.length : TIPS_DATA.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  aria-pressed={isSelected}
                  className={`flex shrink-0 min-h-[40px] items-center gap-2 rounded-full px-3.5 text-[12.5px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? "bg-accent text-white shadow-xs"
                      : "border border-line/80 dark:border-dark-line/80 bg-white/70 dark:bg-dark-card/70 text-ink-secondary dark:text-dark-ink-secondary hover:bg-subtle dark:hover:bg-dark-subtle hover:text-ink dark:hover:text-dark-ink"
                  }`}
                >
                  <span>{language === "ms" ? cat.labelMs : cat.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-ink/5 dark:bg-white/10 text-ink-tertiary dark:text-dark-ink-tertiary"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary dark:text-dark-ink-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "ms" ? "Cari tips, arahan, atau alatan..." : "Search tips, commands, or tools..."}
              className="w-full rounded-full border border-line dark:border-dark-line bg-white/80 dark:bg-dark-card/80 pl-9 pr-8 py-1.5 text-[13px] text-ink dark:text-dark-ink placeholder:text-ink-tertiary dark:placeholder:text-dark-ink-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 backdrop-blur-sm transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ink-tertiary hover:text-ink rounded-full"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid of Tip Cards */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-line dark:border-dark-line bg-white/50 dark:bg-dark-card/50 p-8 text-center backdrop-blur-sm">
          <p className="text-[14px] text-ink-secondary dark:text-dark-ink-secondary">
            {language === "ms" ? "Tiada hasil dijumpai untuk carian anda." : "No results matching your query."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:underline"
          >
            {language === "ms" ? "Tunjukkan semua alatan" : "Show all items"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const isCopied = copiedId === item.id;
              const isExpanded = expandedId === item.id;
              const title = language === "ms" ? item.titleMs : item.title;
              const summary = language === "ms" ? item.summaryMs : item.summary;
              const details = language === "ms" ? item.detailsMs : item.details;
              const safetyNote = language === "ms" ? item.safetyNoteMs : item.safetyNote;
              const iconSrc = getTipIconImage(item);

              return (
                <motion.article
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 28 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.18 },
                  }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-line/80 dark:border-dark-line/80 bg-white/85 dark:bg-dark-card/85 p-5 shadow-card dark:shadow-card-dark hover:border-accent/40 dark:hover:border-dark-accent/40 hover:shadow-card-hover transition-[border-color,box-shadow] duration-200 backdrop-blur-md overflow-hidden"
                >
                  <div>
                    {/* Top Header: App Icon / Logo + Badge & Developer */}
                    <div className="flex items-start gap-3.5 mb-3">
                      {/* Recognizable Software Logo / Icon */}
                      <div className="relative shrink-0 h-12 w-12 rounded-2xl border border-line/80 dark:border-dark-line/80 bg-subtle/60 dark:bg-dark-subtle/60 p-1.5 shadow-2xs group-hover:scale-105 group-hover:shadow-xs transition-transform duration-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={iconSrc}
                          alt={`${title} logo`}
                          className="h-full w-full object-contain rounded-xl"
                          loading="lazy"
                          width={48}
                          height={48}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${item.badgeColor}`}
                          >
                            <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                            <span>{item.badge}</span>
                          </span>

                          {item.developer && (
                            <span className="text-[11px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary truncate">
                              {item.developer}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-[15px] font-bold text-ink dark:text-dark-ink leading-snug group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-[13px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
                      {summary}
                    </p>

                    {/* Command / Action Pill with Quick Copy */}
                    {item.commandOrAction && (
                      <div className="mt-3.5 relative flex items-center justify-between gap-2 rounded-xl border border-line dark:border-dark-line bg-subtle/80 dark:bg-dark-subtle/80 p-2.5 font-mono text-[11.5px] text-ink dark:text-dark-ink">
                        <span className="truncate pr-2 select-all overflow-x-auto no-scrollbar whitespace-pre-line font-mono font-medium">
                          {item.commandOrAction}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.commandOrAction!)}
                          aria-label={isCopied ? "Copied" : "Copy to clipboard"}
                          title={isCopied ? "Copied" : "Copy to clipboard"}
                          className={`shrink-0 flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            isCopied
                              ? "bg-emerald-500 text-white"
                              : "bg-white dark:bg-dark-card border border-line dark:border-dark-line text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink hover:border-accent"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>{language === "ms" ? "Disalin!" : "Copied!"}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>{language === "ms" ? "Salin" : "Copy"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Safety Alert (if applicable) */}
                    {safetyNote && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11.5px] text-amber-700 dark:text-amber-300">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                        <span>{safetyNote}</span>
                      </div>
                    )}

                    {/* Expandable Deep Details */}
                    {details && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId((curr) => (curr === item.id ? null : item.id))}
                          className="inline-flex min-h-[44px] items-center gap-1 text-[11px] font-semibold text-ink-tertiary dark:text-dark-ink-tertiary hover:text-accent transition-colors"
                        >
                          <span>{isExpanded ? (language === "ms" ? "Tutup nota" : "Hide details") : (language === "ms" ? "Ketahui lebih lanjut" : "Technical note")}</span>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary border-l-2 border-accent/40 pl-2.5 py-0.5">
                                {details}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Action Links & Downloads */}
                  {(item.directDownloadUrl || item.downloadPageUrl || item.downloadUrl || item.officialUrl || item.githubUrl) && (
                    <div className="mt-4 pt-3 border-t border-line/60 dark:border-dark-line/60 flex flex-col gap-2.5 text-[12px]">
                      {/* Download Buttons Row */}
                      {(item.directDownloadUrl || item.downloadPageUrl || item.downloadUrl) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {item.directDownloadUrl && (
                            <a
                              href={item.directDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white px-3 py-1.5 min-h-[34px] text-[12px] font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95"
                              title={
                                language === "ms"
                                  ? `Muat turun fail terus (${item.fileType || "fail"})`
                                  : `Direct file download (${item.fileType || "file"})`
                              }
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>
                                {language === "ms"
                                  ? `Muat Turun Terus ${item.fileType || ""}`
                                  : `Direct ${item.fileType || "Download"}`}
                              </span>
                            </a>
                          )}

                          {(item.downloadPageUrl || item.downloadUrl) && (
                            <a
                              href={item.downloadPageUrl || item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-line dark:border-dark-line bg-subtle/60 dark:bg-dark-subtle/60 text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent hover:border-accent dark:hover:border-dark-accent px-3 py-1.5 min-h-[34px] text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
                              title={
                                language === "ms"
                                  ? "Buka portal muat turun rasmi vendor"
                                  : "Open official vendor download portal"
                              }
                            >
                              <span>{language === "ms" ? "Laman Muat Turun" : "Download Page"}</span>
                              <ExternalLink className="h-3 w-3 opacity-70" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Official Info Links Row */}
                      {(item.officialUrl || item.githubUrl) && (
                        <div className="flex items-center gap-3 pt-0.5 text-[11.5px]">
                          {item.officialUrl && (
                            <a
                              href={item.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-ink-secondary dark:text-dark-ink-secondary hover:text-accent dark:hover:text-dark-accent transition-colors"
                            >
                              <span>{language === "ms" ? "Laman Rasmi" : "Official Site"}</span>
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                          )}

                          {item.githubUrl && (
                            <a
                              href={item.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-ink-tertiary dark:text-dark-ink-tertiary hover:text-ink dark:hover:text-dark-ink transition-colors"
                            >
                              <span>GitHub</span>
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

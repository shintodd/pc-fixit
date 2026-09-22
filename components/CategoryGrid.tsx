"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Power,
  MonitorX,
  Gauge,
  WifiOff,
  Flame,
  Cpu,
  HelpCircle,
  type LucideIcon,
  BookOpen,
} from "lucide-react";
import { CATEGORIES, type Severity } from "@/lib/categories";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";
import MovingIcon, { type MovingIconAnimation } from "@/components/MovingIcon";

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-critical/10 text-critical border-critical/20 dark:bg-critical/15 dark:text-critical",
  warn: "bg-warn/10 text-warn border-warn/20 dark:bg-warn/15 dark:text-warn",
  info: "bg-accent/10 text-accent border-accent/20 dark:bg-dark-accent/15 dark:text-dark-accent",
};

const CATEGORY_THEME: Record<
  string,
  {
    icon: LucideIcon;
    animation: MovingIconAnimation;
    glow: string;
    iconBg: string;
    iconColor: string;
    tags: string[];
    titleKey: TranslationKey;
    descKey: TranslationKey;
  }
> = {
  "wont-boot": {
    icon: Power,
    animation: "pulse",
    glow: "group-hover:border-rose-500/40 group-hover:shadow-[0_0_24px_rgba(244,63,94,0.12)]",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white",
    iconColor: "text-rose-500",
    tags: ["No POST", "Black Screen", "DRAM LED", "Power Trip"],
    titleKey: "cat_wont_boot_title",
    descKey: "cat_wont_boot_desc",
  },
  "blue-screen": {
    icon: MonitorX,
    animation: "shake",
    glow: "group-hover:border-blue-500/40 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.12)]",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white",
    iconColor: "text-blue-500",
    tags: ["IRQL_NOT_LESS", "WHEA Fault", "DPC Watchdog", "Kernel Heap"],
    titleKey: "cat_blue_screen_title",
    descKey: "cat_blue_screen_desc",
  },
  "running-slow": {
    icon: Gauge,
    animation: "gauge",
    glow: "group-hover:border-amber-500/40 group-hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    iconBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white",
    iconColor: "text-amber-500",
    tags: ["100% Disk", "TiWorker CPU", "0.79 GHz Lock", "SysMain"],
    titleKey: "cat_running_slow_title",
    descKey: "cat_running_slow_desc",
  },
  "no-internet": {
    icon: WifiOff,
    animation: "bounce",
    glow: "group-hover:border-sky-500/40 group-hover:shadow-[0_0_24px_rgba(14,165,233,0.12)]",
    iconBg: "bg-sky-500/10 text-sky-700 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white",
    iconColor: "text-sky-500",
    tags: ["Gateway Dropped", "Wi-Fi 6E/7", "APIPA 169.254", "DNS Timeout"],
    titleKey: "cat_no_internet_title",
    descKey: "cat_no_internet_desc",
  },
  overheating: {
    icon: Flame,
    animation: "flicker",
    glow: "group-hover:border-orange-500/40 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.12)]",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white",
    iconColor: "text-orange-500",
    tags: ["GDDR6X VRAM", "AIO Air Bubble", "Thermal Paste", "Fan at 100%"],
    titleKey: "cat_overheating_title",
    descKey: "cat_overheating_desc",
  },
  "driver-issues": {
    icon: Cpu,
    animation: "pulse",
    glow: "group-hover:border-purple-500/40 group-hover:shadow-[0_0_24px_rgba(168,85,247,0.12)]",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white",
    iconColor: "text-purple-500",
    tags: ["Code 43", "Code 10", "DDU Clean", "Realtek Audio"],
    titleKey: "cat_driver_issues_title",
    descKey: "cat_driver_issues_desc",
  },
};

export default function CategoryGrid() {
  const { t } = useLanguage();

  const getSeverityLabel = (severity: Severity) => {
    switch (severity) {
      case "critical":
        return t("cat_sev_critical");
      case "warn":
        return t("cat_sev_warn");
      case "info":
        return t("cat_sev_info");
      default:
        return severity;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {CATEGORIES.map((cat, idx) => {
        const theme = CATEGORY_THEME[cat.slug] || {
          icon: HelpCircle,
          animation: "pulse" as MovingIconAnimation,
          glow: "group-hover:border-accent/40",
          iconBg: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white",
          iconColor: "text-accent",
          tags: ["Diagnosis", "Repair"],
          titleKey: "categories_title" as TranslationKey,
          descKey: "categories_subtitle" as TranslationKey,
        };
        const IconComponent = theme.icon;
        const title = theme.titleKey ? t(theme.titleKey) : cat.title;
        const description = theme.descKey ? t(theme.descKey) : cat.description;
        const label = t("cat_guides_count", { count: cat.count || 30 });

        return (
          <motion.div
            key={cat.slug}
            initial="initial"
            animate="initial"
            variants={{
              initial: { opacity: 1, y: 0 },
              hover: { y: -4 },
            }}
            transition={{
              duration: 0.35,
              delay: idx * 0.03,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover="hover"
            whileTap={{ scale: 0.985 }}
            className="group opacity-100"
          >
            <Link
              href={`/categories/${cat.slug}`}
              className={`flex h-full flex-col justify-between rounded-[18px] border border-line dark:border-dark-line bg-white dark:bg-dark-card p-6 transition-all duration-200 hover:border-line-strong dark:hover:border-dark-line-strong hover:scale-[1.01] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
            >
              <div>
                {/* Header row */}
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 ${theme.iconBg}`}
                  >
                    <MovingIcon
                      icon={IconComponent}
                      animation={theme.animation}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                        SEVERITY_STYLE[cat.severity]
                      }`}
                    >
                      {getSeverityLabel(cat.severity)}
                    </span>
                    <motion.span
                      variants={{
                        initial: { x: 0, y: 0 },
                        hover: { x: 2, y: -2, transition: { duration: 0.2, ease: "easeOut" } },
                      }}
                      className="inline-flex items-center justify-center text-ink-tertiary dark:text-dark-ink-tertiary group-hover:text-ink dark:group-hover:text-dark-ink transition-colors"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-[17px] font-semibold tracking-tight text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors duration-150">
                  {title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
                  {description}
                </p>

                {/* Symptom chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {theme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-subtle/80 dark:bg-dark-subtle/80 px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary dark:text-dark-ink-secondary border border-line/40 dark:border-dark-line/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-6 flex items-center justify-between border-t border-line/60 dark:border-dark-line/60 pt-4 text-[12px] font-medium">
                <span className="flex items-center gap-1.5 text-ink-secondary dark:text-dark-ink-secondary">
                  <BookOpen className="h-3.5 w-3.5 text-ink-tertiary dark:text-dark-ink-tertiary" aria-hidden="true" />
                  <span>{label}</span>
                </span>
                <span className="flex items-center gap-1 text-accent dark:text-dark-accent font-semibold group-hover:underline">
                  <span>{t("cat_action_browse")}</span>
                  <motion.span
                    variants={{
                      initial: { x: 0 },
                      hover: { x: 3, transition: { duration: 0.2, ease: "easeOut" } },
                    }}
                    className="inline-block"
                    aria-hidden="true"
                  >
                    &rarr;
                  </motion.span>
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

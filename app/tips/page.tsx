"use client";

import Link from "next/link";
import { Sparkles, Terminal, Wrench, ChevronRight, ShieldCheck } from "lucide-react";
import QuickTipsFeed from "@/components/QuickTipsFeed";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TIPS_DATA } from "@/lib/tips-data";

export default function TipsPage() {
  const { language } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[12.5px] text-ink-tertiary dark:text-dark-ink-tertiary">
        <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-ink dark:hover:text-dark-ink transition-colors">
          {language === "ms" ? "Utama" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-ink dark:text-dark-ink">
          {language === "ms" ? "Tips & Alatan Berkuasa" : "Quick Tips & Tools"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-surface px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent shadow-xs mb-3">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{language === "ms" ? "Pustaka Alatan Berkuasa" : "Power User Resource Hub"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink dark:text-dark-ink leading-[1.15]">
          {language === "ms" ? "Koleksi Tips Padu, " : "Curated Power Tips, "}
          <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
            {language === "ms" ? "Alatan Hebat & Rahsia PC." : "Cool Tools & Hidden Gems."}
          </span>
        </h1>

        <p className="mt-3 text-[15px] sm:text-base leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
          {language === "ms"
            ? "Himpunan arahan terminal CMD/PowerShell berkuasa, perisian percuma berwibawa, alatan debloat terpilih, dan easter egg Windows yang disahkan selamat."
            : "Handpicked terminal commands, free verified utilities, debloating playbooks, and retro Windows easter eggs tested for speed, stability, and safety."}
        </p>

        {/* Value Highlights */}
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary">
          <span className="inline-flex items-center gap-1 rounded-full border border-line dark:border-dark-line bg-white/70 dark:bg-dark-card/70 px-2.5 py-1">
            <Terminal className="h-3.5 w-3.5 text-accent" />
            <span>{TIPS_DATA.filter((i) => i.category === "pc-tips").length} {language === "ms" ? "Arahan Terminal" : "CLI Commands"}</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-line dark:border-dark-line bg-white/70 dark:bg-dark-card/70 px-2.5 py-1">
            <Wrench className="h-3.5 w-3.5 text-purple-500" />
            <span>{TIPS_DATA.filter((i) => i.category === "cool-tools").length} {language === "ms" ? "Alatan Percuma" : "Free Utilities"}</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-line dark:border-dark-line bg-white/70 dark:bg-dark-card/70 px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>{language === "ms" ? "100% Bebas Spyware & Disahkan" : "100% Free & Spyware-Free"}</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Tips Feed */}
      <QuickTipsFeed initialCategory="all" showSearch={true} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import QuickTipsFeed from "@/components/QuickTipsFeed";
import { TIPS_DATA } from "@/lib/tips-data";

export default function HomeTipsPreview() {
  const { language } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 sm:py-16 border-t border-line/60 dark:border-dark-line/60">
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-surface px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent shadow-xs mb-2.5">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{language === "ms" ? "Tips Pilihan & Alatan Hebat" : "Featured Power Tips & Tools"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-dark-ink">
            {language === "ms" ? "Trik Komputer, Alatan Percuma & Rahsia Windows" : "Pro Tricks, Free Utilities & Windows Gems"}
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-secondary dark:text-dark-ink-secondary max-w-xl">
            {language === "ms"
              ? "Arahan pantas dan utiliti terpilih untuk mengoptimumkan, membaiki, dan menyegarkan sistem anda."
              : "Handy one-liners, debloat playbooks, and top open-source tools to inspect and tweak your PC."}
          </p>
        </div>

        <Link
          href="/tips"
          className="inline-flex items-center gap-2 rounded-full border border-line-strong dark:border-dark-line-strong bg-white/80 dark:bg-dark-card/80 px-4 py-2 text-[13.5px] font-semibold text-ink dark:text-dark-ink backdrop-blur-sm transition-all duration-150 hover:border-accent hover:text-accent dark:hover:text-dark-accent shadow-2xs hover:shadow-sm shrink-0"
        >
          <span>
            {language === "ms" ? `Lihat Semua ${TIPS_DATA.length} Tips & Alatan` : `Explore All ${TIPS_DATA.length} Tips & Tools`}
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Grid of Top Curated Items */}
      <QuickTipsFeed initialCategory="all" showSearch={false} maxItems={6} />
    </section>
  );
}

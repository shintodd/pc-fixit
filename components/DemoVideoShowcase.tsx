"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DemoVideoShowcase() {
  const { t } = useLanguage();

  return (
    <section className="relative mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 sm:py-16 border-t border-line/60 dark:border-dark-line/60">
      {/* Subtle Ambient Back-Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-80 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3.5 py-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400 shadow-xs mb-3">
          <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{t("demo_badge")}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink dark:text-dark-ink">
          {t("demo_title")}
        </h2>
        <p className="mt-2.5 text-[14px] sm:text-[15px] text-ink-secondary dark:text-dark-ink-secondary max-w-2xl mx-auto leading-relaxed">
          {t("demo_subtitle")}
        </p>
      </div>

      {/* Clean Looping Video Frame */}
      <div className="mx-auto max-w-5xl rounded-2xl sm:rounded-3xl border border-line/80 dark:border-dark-line/80 bg-black shadow-2xl dark:shadow-card-dark overflow-hidden backdrop-blur-md">
        <video
          src="/videos/pcfix-demo.mp4"
          poster="/videos/pcfix-demo-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover block aspect-video pointer-events-none select-none"
          aria-label="pcfix product demo video"
        />
      </div>
    </section>
  );
}

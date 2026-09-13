"use client";

import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  Cpu,
  Wrench,
  Layers,
  ArrowRight,
} from "lucide-react";
import HeroScan from "@/components/HeroScan";
import CategoryGrid from "@/components/CategoryGrid";
import HeroInput from "@/components/HeroInput";
import QuickTriageDeck from "@/components/QuickTriageDeck";
import QuickToolsBar from "@/components/QuickToolsBar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  const HOW_IT_WORKS = [
    {
      step: "01",
      icon: MessageSquare,
      title: t("how_step1_title"),
      body: t("how_step1_desc"),
      glow: "border-blue-500/20 bg-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      step: "02",
      icon: Cpu,
      title: t("how_step2_title"),
      body: t("how_step2_desc"),
      glow: "border-purple-500/20 bg-purple-500/5",
      iconColor: "text-purple-500",
    },
    {
      step: "03",
      icon: Wrench,
      title: t("how_step3_title"),
      body: t("how_step3_desc"),
      glow: "border-emerald-500/20 bg-emerald-500/5",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden pt-10 pb-12 sm:pt-20 sm:pb-24">
        <HeroScan />
        <div className="relative mx-auto w-full max-w-5xl 2xl:max-w-6xl px-4 text-center sm:px-8 lg:px-12">
          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-ink dark:text-dark-ink sm:text-6xl md:text-7xl 2xl:text-8xl">
            {t("hero_title_prefix")}
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
              {t("hero_title_accent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl 2xl:max-w-3xl text-lg sm:text-xl 2xl:text-2xl text-ink-secondary dark:text-dark-ink-secondary leading-relaxed font-normal">
            {t("hero_description")}
          </p>

          {/* Interactive Command Deck */}
          <HeroInput />
        </div>
      </section>

      {/* Instant Symptom Triage Deck */}
      <QuickTriageDeck />

      {/* Interactive Diagnostic Usability Tools */}
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 pt-6 pb-2">
        <QuickToolsBar />
      </div>

      {/* Category Browse Section */}
      <section className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-14 sm:py-20 border-t border-line/60 dark:border-dark-line/60">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-surface px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent shadow-xs mb-2.5">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("cat_library_badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-dark-ink">
              {t("cat_browse_title")}
            </h2>
            <p className="mt-1.5 text-[15px] text-ink-secondary dark:text-dark-ink-secondary max-w-xl">
              {t("cat_browse_subtitle")}
            </p>
          </div>

          <Link
            href="/troubleshoot"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-accent dark:text-dark-accent hover:underline shrink-0"
          >
            <span>{t("cat_ask_ai")}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <CategoryGrid />
      </section>

      {/* How It Works */}
      <section className="border-t border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-line dark:border-dark-line bg-white dark:bg-dark-card px-3.5 py-1 text-[12px] font-semibold text-ink-secondary dark:text-dark-ink-secondary shadow-xs mb-3">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>{t("how_badge")}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dark-ink sm:text-4xl">
              {t("how_title")}
            </h2>
            <p className="mt-3 text-ink-secondary dark:text-dark-ink-secondary text-base max-w-lg mx-auto leading-relaxed">
              {t("how_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, body, glow, iconColor }) => (
              <div
                key={step}
                className={`relative flex flex-col justify-between rounded-2xl border ${glow} bg-white/95 dark:bg-dark-card/95 p-7 shadow-card dark:shadow-card-dark backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover`}
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-subtle dark:bg-dark-subtle ${iconColor} shadow-2xs`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-3xl font-black tracking-tight text-ink-tertiary/30 dark:text-dark-ink-tertiary/30 tabular select-none" aria-hidden="true">
                      {step}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-bold tracking-tight text-ink dark:text-dark-ink mb-2">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

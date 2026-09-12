"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Sparkles,
  X,
  Wrench,
  CornerDownLeft,
  Flame,
  Zap,
  MonitorX,
  WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HeroInput() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const POPULAR_QUERIES = [
    { label: t("hero_pill_no_display"), icon: MonitorX, color: "text-rose-500" },
    { label: t("hero_pill_clicks_off"), icon: Zap, color: "text-amber-500" },
    { label: t("hero_pill_bsod"), icon: Sparkles, color: "text-blue-500" },
    { label: t("hero_pill_no_internet"), icon: WifiOff, color: "text-sky-500" },
    { label: t("hero_pill_fans_100"), icon: Flame, color: "text-orange-500" },
  ];

  function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault();
    const q = value.trim();
    router.push(q ? `/troubleshoot?q=${encodeURIComponent(q)}` : "/troubleshoot");
  }

  function handleQuickPrompt(prompt: string) {
    setValue(prompt);
    router.push(`/troubleshoot?q=${encodeURIComponent(prompt)}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mt-8 w-full max-w-2xl lg:max-w-3xl 2xl:max-w-4xl"
    >
      {/* Modern Command Search Bar */}
      <form
        role="search"
        aria-label="Search diagnostic guides"
        onSubmit={handleSubmit}
        className="group relative flex items-center gap-3 rounded-2xl border border-line-strong/80 dark:border-dark-line-strong/80 bg-white/95 dark:bg-dark-card/95 p-2.5 pl-5 shadow-lg shadow-black/[0.03] dark:shadow-black/20 backdrop-blur-xl transition-all duration-200 focus-within:border-accent dark:focus-within:border-dark-accent focus-within:ring-4 focus-within:ring-accent/15 focus-within:shadow-xl"
      >
        <Search
          className="h-5 w-5 shrink-0 text-ink-tertiary dark:text-dark-ink-tertiary transition-colors group-focus-within:text-accent dark:group-focus-within:text-dark-accent"
          aria-hidden="true"
        />

        <input
          id="hero-search-input"
          name="q"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("hero_input_placeholder")}
          aria-label={t("hero_input_placeholder")}
          autoComplete="off"
          className="flex-1 bg-transparent text-[15px] sm:text-[16px] text-ink dark:text-dark-ink placeholder:text-ink-tertiary dark:placeholder:text-dark-ink-tertiary focus:outline-none"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => setValue("")}
              className="p-1 text-ink-tertiary dark:text-dark-ink-tertiary hover:text-ink dark:hover:text-dark-ink transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex h-10 items-center gap-2 rounded-xl bg-accent dark:bg-accent px-4 text-[13.5px] font-semibold text-white transition-all duration-150 hover:bg-accent-hover shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label={t("hero_btn_diagnose")}
        >
          <span>{t("hero_btn_diagnose")}</span>
          <CornerDownLeft className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
        </motion.button>
      </form>

      {/* Interactive Quick-Prompt Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[12px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary mr-1">
          {t("hero_try_asking")}
        </span>
        {POPULAR_QUERIES.map((q, idx) => {
          const Icon = q.icon;
          return (
            <motion.button
              key={q.label}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.04, duration: 0.2 }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPrompt(q.label)}
              aria-label={`Diagnose: ${q.label}`}
              className="flex min-h-[30px] items-center gap-1.5 rounded-lg border border-line dark:border-dark-line bg-white/70 dark:bg-dark-card/70 px-3 py-1 text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary backdrop-blur-sm transition-all duration-150 hover:border-accent/40 hover:bg-accent/10 dark:hover:bg-dark-accent/15 hover:text-accent dark:hover:text-dark-accent shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon className={`h-3.5 w-3.5 ${q.color}`} aria-hidden="true" />
              <span>{q.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Dual CTA Actions */}
      <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/troubleshoot"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-ink dark:bg-white px-5 py-2.5 text-[14px] font-semibold text-white dark:text-ink shadow-sm transition-all duration-150 hover:bg-ink/90 dark:hover:bg-white/90 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Sparkles className="h-4 w-4 text-accent dark:text-accent" aria-hidden="true" />
          <span>{t("hero_action_launch_ai")}</span>
        </Link>

        <Link
          href="/wizard"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line-strong dark:border-dark-line-strong bg-white/80 dark:bg-dark-card/80 px-5 py-2.5 text-[14px] font-semibold text-ink dark:text-dark-ink backdrop-blur-sm transition-all duration-150 hover:bg-subtle dark:hover:bg-dark-subtle active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Wrench className="h-4 w-4 text-ink-secondary dark:text-dark-ink-secondary" aria-hidden="true" />
          <span>{t("hero_action_wizard")}</span>
          <ArrowRight className="h-3.5 w-3.5 text-ink-tertiary" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}

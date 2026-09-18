"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
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
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { loadSessions, type ChatSession } from "@/lib/chat-storage";
import MovingIcon, { type MovingIconAnimation } from "@/components/MovingIcon";

export default function HeroInput() {
  const [value, setValue] = useState("");
  const [recentSession, setRecentSession] = useState<ChatSession | null>(null);
  const router = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    const stored = loadSessions();
    if (stored.length > 0) {
      setRecentSession(stored[0]);
    }
  }, []);

  const POPULAR_QUERIES: Array<{
    label: string;
    icon: typeof MonitorX;
    color: string;
    animation: MovingIconAnimation;
  }> = [
    { label: t("hero_pill_no_display"), icon: MonitorX, color: "text-rose-500", animation: "shake" },
    { label: t("hero_pill_clicks_off"), icon: Zap, color: "text-amber-500", animation: "pulse" },
    { label: t("hero_pill_bsod"), icon: Sparkles, color: "text-blue-500", animation: "spin" },
    { label: t("hero_pill_no_internet"), icon: WifiOff, color: "text-sky-500", animation: "bounce" },
    { label: t("hero_pill_fans_100"), icon: Flame, color: "text-orange-500", animation: "flicker" },
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
      {/* Modern Command Search Bar with Apple Liquid Glass */}
      <div className="relative group">
        {/* Luminous refraction halo that shines through the liquid frosted glass */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 -z-10 rounded-[30px] bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-indigo-500/30 blur-xl opacity-80 dark:opacity-65 transition-all duration-300 group-focus-within:opacity-100 group-focus-within:scale-[1.02]"
        />

        <LiquidGlassCard
          as="form"
          role="search"
          aria-label="Search diagnostic guides"
          onSubmit={handleSubmit}
          borderRadius={24}
          className="relative flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 pl-3.5 sm:pl-5 transition-all duration-200 focus-within:border-accent dark:focus-within:border-dark-accent focus-within:ring-4 focus-within:ring-accent/15 focus-within:shadow-xl"
        >
          <Search
            className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 text-ink-tertiary dark:text-dark-ink-tertiary transition-colors group-focus-within:text-accent dark:group-focus-within:text-dark-accent"
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
            className="min-w-0 flex-1 bg-transparent text-base text-ink dark:text-dark-ink placeholder:text-ink-tertiary dark:placeholder:text-dark-ink-tertiary focus:outline-none"
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
                className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center p-1 text-ink-tertiary dark:text-dark-ink-tertiary hover:text-ink dark:hover:text-dark-ink transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            className="flex h-10 sm:h-11 shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-accent dark:bg-accent px-3 sm:px-4 text-[13px] sm:text-[14px] font-semibold text-white transition-all duration-150 hover:bg-accent-hover shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label={t("hero_btn_diagnose")}
          >
            <span>{t("hero_btn_diagnose")}</span>
            <CornerDownLeft className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
          </motion.button>
        </LiquidGlassCard>
      </div>

      {/* Interactive Quick-Prompt Chips (Mobile swipe rail with soft fade, desktop wrap) */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="text-[12px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary px-1 sm:px-0 sm:mr-1 shrink-0">
          {t("hero_try_asking")}
        </span>
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar touch-scroll scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0 [mask-image:linear-gradient(to_right,transparent_0%,black_16px,black_calc(100%-24px),transparent_100%)] sm:[mask-image:none]">
          <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap justify-start sm:justify-center">
            {POPULAR_QUERIES.map((q, idx) => {
              const Icon = q.icon;
              return (
                <motion.button
                  key={q.label}
                  type="button"
                  initial="initial"
                  animate="initial"
                  variants={{
                    initial: { opacity: 1, y: 0 },
                    hover: { y: -2, scale: 1.02 },
                  }}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickPrompt(q.label)}
                  aria-label={`Diagnose: ${q.label}`}
                  className="group flex min-h-[36px] shrink-0 items-center gap-2 rounded-pill border border-line/80 dark:border-dark-line/80 bg-white/80 dark:bg-dark-card/80 px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary backdrop-blur-md transition-all duration-150 hover:border-accent/40 hover:bg-accent/10 dark:hover:bg-dark-accent/15 hover:text-accent dark:hover:text-dark-accent shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <MovingIcon icon={Icon} animation={q.animation} className={`h-4 w-4 ${q.color}`} />
                  <span className="whitespace-nowrap">{q.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resume Recent Chat if session exists */}
      {recentSession && (
        <div className="mt-4 flex justify-center">
          <Link
            href="/troubleshoot"
            className="group inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 dark:bg-accent/10 hover:bg-accent/10 dark:hover:bg-accent/15 px-3.5 py-1.5 text-[12px] font-medium text-accent dark:text-dark-accent transition-all duration-150 backdrop-blur-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <History className="h-3.5 w-3.5 shrink-0 text-accent transition-transform group-hover:rotate-[-20deg]" aria-hidden="true" />
            <span className="text-ink-secondary dark:text-dark-ink-secondary">
              {language === "ms" ? "Sambung diagnostik:" : "Resume diagnosis:"}
            </span>
            <span className="font-semibold text-accent max-w-[200px] sm:max-w-[280px] truncate">
              {recentSession.title}
            </span>
            <ArrowRight className="h-3 w-3 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Dual CTA Actions */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/troubleshoot"
          className="group flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-pill bg-ink dark:bg-white px-6 py-3 text-[14.5px] font-semibold text-white dark:text-ink shadow-sm transition-all duration-150 hover:bg-ink/90 dark:hover:bg-white/90 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <MovingIcon icon={Sparkles} animation="spin" className="h-4 w-4 text-accent dark:text-accent" />
          <span>{t("hero_action_launch_ai")}</span>
        </Link>

        <Link
          href="/wizard"
          className="group flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-pill border border-line-strong dark:border-dark-line-strong bg-white/80 dark:bg-dark-card/80 px-6 py-3 text-[14.5px] font-semibold text-ink dark:text-dark-ink backdrop-blur-sm transition-all duration-150 hover:bg-subtle dark:hover:bg-dark-subtle active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <MovingIcon icon={Wrench} animation="wrench" className="h-4 w-4 text-ink-secondary dark:text-dark-ink-secondary" />
          <span>{t("hero_action_wizard")}</span>
          <ArrowRight className="h-3.5 w-3.5 text-ink-tertiary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}

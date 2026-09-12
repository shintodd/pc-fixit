"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage, isMounted } = useLanguage();

  if (!isMounted) {
    return (
      <div
        className={`h-8 w-[72px] shrink-0 rounded-full border border-line bg-subtle dark:border-dark-line dark:bg-dark-subtle ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`relative inline-flex h-8 items-center rounded-full border border-line bg-subtle p-0.5 text-[11px] font-semibold text-ink-secondary dark:border-dark-line dark:bg-dark-subtle dark:text-dark-ink-secondary ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <div className="flex items-center pl-1.5 pr-1 text-slate-400 dark:text-slate-500" aria-hidden="true">
        <Globe className="h-3.5 w-3.5" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`relative z-10 rounded-full px-2 py-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
          language === "en" ? "text-ink font-bold dark:text-dark-ink" : "hover:text-ink dark:hover:text-dark-ink"
        }`}
        aria-pressed={language === "en"}
        title="Switch to English"
      >
        {language === "en" && (
          <motion.div
            layoutId="active-lang-pill"
            className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-dark-card border border-line/60 dark:border-dark-line"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ zIndex: -1 }}
          />
        )}
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage("ms")}
        className={`relative z-10 rounded-full px-2 py-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
          language === "ms" ? "text-ink font-bold dark:text-dark-ink" : "hover:text-ink dark:hover:text-dark-ink"
        }`}
        aria-pressed={language === "ms"}
        title="Tukar ke Bahasa Melayu"
      >
        {language === "ms" && (
          <motion.div
            layoutId="active-lang-pill"
            className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-dark-card border border-line/60 dark:border-dark-line"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ zIndex: -1 }}
          />
        )}
        BM
      </button>
    </div>
  );
}

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
        className={`h-8 w-[88px] shrink-0 rounded-full border border-line bg-subtle dark:border-dark-line dark:bg-dark-subtle ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isMs = language === "ms";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex h-8 items-center rounded-full border border-line bg-subtle p-0.5 text-[11px] font-semibold text-ink-secondary dark:border-dark-line dark:bg-dark-subtle dark:text-dark-ink-secondary select-none ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {/* Globe icon with subtle spring rotation on language switch */}
      <div className="flex items-center pl-2 pr-1 text-slate-400 dark:text-slate-500" aria-hidden="true">
        <motion.div
          animate={{ rotate: isMs ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="flex items-center justify-center"
        >
          <Globe className="h-3.5 w-3.5" />
        </motion.div>
      </div>

      {/* Segmented sliding switch track */}
      <div className="relative flex items-center">
        {/* Physical sliding pill with spring physics */}
        <motion.div
          className="absolute top-0 bottom-0 w-[30px] rounded-full bg-white shadow-xs dark:bg-dark-card border border-line/60 dark:border-dark-line pointer-events-none"
          animate={{
            x: isMs ? 30 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 480,
            damping: 30,
          }}
        />

        {/* English Button */}
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className="relative z-10 flex h-7 w-[30px] items-center justify-center rounded-full text-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-pressed={!isMs}
          aria-label="Switch to English"
          title="Switch to English"
        >
          <motion.span
            animate={{
              scale: !isMs ? 1.05 : 0.92,
              opacity: !isMs ? 1 : 0.6,
            }}
            transition={{ duration: 0.18 }}
            className={
              !isMs
                ? "font-bold text-ink dark:text-dark-ink"
                : "font-medium text-ink-secondary hover:text-ink dark:text-dark-ink-secondary dark:hover:text-dark-ink"
            }
          >
            EN
          </motion.span>
        </button>

        {/* Bahasa Melayu Button */}
        <button
          type="button"
          onClick={() => setLanguage("ms")}
          className="relative z-10 flex h-7 w-[30px] items-center justify-center rounded-full text-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-pressed={isMs}
          aria-label="Tukar ke Bahasa Melayu"
          title="Tukar ke Bahasa Melayu"
        >
          <motion.span
            animate={{
              scale: isMs ? 1.05 : 0.92,
              opacity: isMs ? 1 : 0.6,
            }}
            transition={{ duration: 0.18 }}
            className={
              isMs
                ? "font-bold text-ink dark:text-dark-ink"
                : "font-medium text-ink-secondary hover:text-ink dark:text-dark-ink-secondary dark:hover:text-dark-ink"
            }
          >
            BM
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: only render toggle state after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-8 w-14 shrink-0 rounded-full border border-line bg-subtle dark:border-dark-line dark:bg-dark-subtle"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className="relative flex h-8 w-14 shrink-0 items-center rounded-full border border-line bg-subtle transition-colors duration-200 before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:border-dark-line dark:bg-dark-subtle dark:focus-visible:ring-dark-accent dark:focus-visible:ring-offset-dark-surface"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding thumb */}
      <motion.div
        className="absolute left-0.5 flex h-7 w-7 items-center justify-center rounded-full shadow-sm border border-line/20 dark:border-dark-line/60"
        animate={{
          x: isDark ? 24 : 0,
          backgroundColor: isDark ? "#161b22" : "#ffffff",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ scale: 0.6, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, rotate: 45, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <Moon className="h-3.5 w-3.5 text-dark-accent" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ scale: 0.6, rotate: 45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, rotate: -45, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <Sun className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const navLinks = [
    { href: "/troubleshoot", label: t("nav_diagnostician") },
    { href: "/wizard", label: t("nav_guided_fix") },
    { href: "/tips", label: t("nav_tips") },
    { href: "/", label: t("nav_knowledge_base") },
  ];

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close mobile menu on pathname change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scrolling when mobile navigation is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`sticky top-0 z-50 shrink-0 w-full border-b border-line transition-colors duration-200 dark:border-dark-line ${open ? "bg-white dark:bg-[#161b22]" : "bg-surface/85 backdrop-blur-xl dark:bg-dark-surface/85"}`}>
      {/* Under Development Notice Banner */}
      <aside
        aria-label="Development preview announcement"
        className="w-full border-b border-amber-500/30 bg-amber-500/[0.14] dark:border-amber-400/25 dark:bg-amber-950/50 px-4 py-2 sm:py-2.5 text-center text-[13px] sm:text-[14px] font-medium text-amber-900 dark:text-amber-200 transition-colors"
      >
        <div className="mx-auto flex w-full max-w-7xl 2xl:max-w-[1720px] items-center justify-center gap-1.5 flex-wrap leading-snug">
          <span>
            {language === "ms"
              ? "Laman web pcfix ini sedang dalam pembangunan aktif. Ada sebarang masalah atau cadangan?"
              : "pcfix is currently under active development. Have an issue or suggestion?"}
          </span>
          <a
            href="mailto:pcfixtechsupport@gmail.com"
            className="font-semibold underline underline-offset-2 hover:text-amber-700 dark:hover:text-white transition-colors"
          >
            pcfixtechsupport@gmail.com
          </a>
        </div>
      </aside>

      <div className="mx-auto flex w-full max-w-7xl 2xl:max-w-[1720px] items-center justify-between px-4 sm:px-8 lg:px-12 2xl:px-16 py-3">
        <Link
          href="/"
          className="group flex items-center text-[15px] font-semibold tracking-tight text-ink dark:text-dark-ink"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-ink dark:text-dark-ink bg-subtle dark:bg-dark-subtle"
                    : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-2 -bottom-3 h-[2px] bg-accent dark:bg-dark-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="mx-2 h-4 w-px bg-line dark:bg-dark-line" />

          <LanguageToggle />

          <ThemeToggle />

          <Link
            href="/troubleshoot"
            className="ml-2 group inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-1.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-95 shadow-sm shadow-accent/20"
          >
            <Sparkles className="h-3.5 w-3.5 opacity-80 transition-transform duration-200 group-hover:rotate-12" aria-hidden="true" />
            <span>{t("nav_start_diagnosis")}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink dark:text-dark-ink transition-colors hover:bg-subtle dark:hover:bg-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-0 z-40 bg-black/50 backdrop-blur-xs sm:hidden"
              aria-hidden="true"
            />
            {/* Mobile Sheet */}
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 top-full z-50 border-b border-line dark:border-dark-line bg-white dark:bg-[#161b22] px-5 py-4 shadow-2xl sm:hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-subtle dark:bg-dark-subtle text-ink dark:text-dark-ink font-semibold"
                        : "text-ink-secondary dark:text-dark-ink-secondary hover:bg-subtle/60 dark:hover:bg-dark-subtle/60 hover:text-ink dark:hover:text-dark-ink"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Drawer Settings (Language & Quick CTA) */}
                <div className="mt-2 pt-3 border-t border-line/70 dark:border-dark-line/70 flex items-center justify-between px-1">
                  <span className="text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary">
                    {language === "ms" ? "Pilihan Bahasa" : "Language"}
                  </span>
                  <LanguageToggle />
                </div>

                <div className="pt-3">
                  <Link
                    href="/troubleshoot"
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[14px] font-semibold text-white shadow-sm shadow-accent/20 active:scale-98"
                    onClick={() => setOpen(false)}
                  >
                    <Sparkles className="h-4 w-4 opacity-80" aria-hidden="true" />
                    <span>{t("nav_start_diagnosis")}</span>
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

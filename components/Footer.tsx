"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname === "/troubleshoot") {
    return null;
  }

  return (
    <footer className="border-t border-line dark:border-dark-line bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl 2xl:max-w-[1720px] flex-col gap-6 px-4 sm:px-8 lg:px-12 2xl:px-16 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="group flex items-center">
            <Logo size={28} />
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-line dark:border-dark-line bg-white/80 dark:bg-dark-card/80 px-3 py-1 text-[12px] text-ink-secondary dark:text-dark-ink-secondary shadow-xs">
            <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
            <span>{t("footer_status")}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] text-ink-secondary dark:text-dark-ink-secondary border-t border-line/60 dark:border-dark-line/60 pt-6">
          <p>
            {t("footer_disclaimer")}{" "}
            <a
              href="mailto:pcfixtechsupport@gmail.com"
              className="inline-flex min-h-[44px] items-center font-medium underline underline-offset-2 hover:text-ink dark:hover:text-dark-ink transition-colors"
            >
              pcfixtechsupport@gmail.com
            </a>
          </p>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/troubleshoot" className="py-1.5 hover:text-ink dark:hover:text-dark-ink transition-colors">
              {t("footer_nav_diagnose")}
            </Link>
            <Link href="/wizard" className="py-1.5 hover:text-ink dark:hover:text-dark-ink transition-colors">
              {t("footer_nav_guided_fix")}
            </Link>
            <Link href="/tips" className="py-1.5 hover:text-ink dark:hover:text-dark-ink transition-colors">
              {t("nav_tips" as any) || "Tips & Tools"}
            </Link>
            <Link href="/" className="py-1.5 hover:text-ink dark:hover:text-dark-ink transition-colors">
              {t("footer_nav_kb")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Wrench } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application segment error caught by App Router boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-critical/30 bg-surface dark:bg-dark-card p-6 sm:p-8 text-center shadow-card dark:shadow-card-dark">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-critical/10 text-critical">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink dark:text-dark-ink sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
          An unexpected error occurred while loading this troubleshooting view. You can try refreshing the section or navigate back to safety.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-ink-tertiary dark:text-dark-ink-tertiary">
            Error reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-pill bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-pill border border-line dark:border-dark-line bg-surface dark:bg-dark-subtle px-4 py-2 text-sm font-medium text-ink dark:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Home className="h-4 w-4 text-ink-secondary dark:text-dark-ink-secondary" aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 rounded-pill border border-line dark:border-dark-line bg-surface dark:bg-dark-subtle px-4 py-2 text-sm font-medium text-ink dark:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Guided Fix</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

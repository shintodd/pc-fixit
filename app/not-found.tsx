import Link from "next/link";
import { ArrowLeft, FileQuestion, Sparkles, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line dark:border-dark-line bg-subtle dark:bg-dark-subtle text-accent dark:text-dark-accent shadow-xs">
          <FileQuestion className="h-8 w-8" aria-hidden="true" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-accent dark:text-dark-accent">
          404 Error
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink dark:text-dark-ink sm:text-4xl">
          Guide or page not found
        </h1>
        <p className="mt-3 text-base text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
          The troubleshooting guide or resource you requested doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/25 hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/troubleshoot"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-pill border border-line dark:border-dark-line bg-surface dark:bg-dark-card px-5 py-2.5 text-sm font-medium text-ink dark:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>AI Diagnostician</span>
          </Link>
          <Link
            href="/wizard"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-pill border border-line dark:border-dark-line bg-surface dark:bg-dark-card px-5 py-2.5 text-sm font-medium text-ink dark:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Guided Fix</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

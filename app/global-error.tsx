"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 antialiased p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 sm:p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Critical Application Error
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            A fatal error interrupted the diagnostic interface. Please try reloading the page.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-gray-500">
              Digest: {error.digest}
            </p>
          )}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Reload Interface
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

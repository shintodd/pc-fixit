"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const InteractiveDiagnosticPlayer = dynamic(
  () => import("@/components/remotion/InteractiveDiagnosticPlayer"),
  { ssr: false }
);

export default function DiagnosticPlayerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  }) {
  const { language } = useLanguage();
  const isMs = language === "ms";

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-5xl bg-surface dark:bg-[#12161f] border border-line dark:border-dark-line rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Interactive Diagnostic Video Player"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-line dark:border-dark-line mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-ink dark:text-dark-ink">
                      {isMs ? "Pemain Video Diagnostik Interaktif" : "Interactive Diagnostic Video Player"}
                    </h2>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Remotion Engine
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary dark:text-dark-ink-secondary mt-0.5">
                    {isMs
                      ? "Video dipacu oleh React DOM & Canvas secara langsung tanpa muat turun fail video berat"
                      : "Video rendered directly in-browser via React DOM and Canvas without static video downloads"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-subtle dark:hover:bg-dark-subtle text-ink-secondary dark:text-dark-ink-secondary transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Remotion Player */}
            <InteractiveDiagnosticPlayer />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

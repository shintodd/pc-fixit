"use client";

import React, { useState, useEffect } from "react";
import { X, TrendingDown, TrendingUp, History, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PartItem } from "@/lib/parts/types";

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: PartItem | null;
}

interface HistoryPoint {
  date: string;
  priceMyr: number;
  retailerName: string;
}

export default function PriceHistoryModal({ isOpen, onClose, part }: PriceHistoryModalProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !part) return;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/parts/${part.slug}/history`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.history) {
          setHistory(data.history);
        } else {
          setHistory([]);
        }
      })
      .catch((err) => console.error("Error loading price history:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, part]);

  if (!isOpen || !part) return null;

  const prices = history.map((h) => h.priceMyr);
  const minPrice = prices.length > 0 ? Math.min(...prices) : part.bestPriceMyr;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : part.bestPriceMyr;
  const currentPrice = part.bestPriceMyr;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="price-history-title"
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-[18px] bg-canvas border border-line shadow-2xl overflow-hidden dark:bg-dark-surface dark:border-dark-line"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                <History className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="price-history-title" className="text-base font-semibold text-ink dark:text-white">
                  Price History & Trends
                </h2>
                <p className="text-xs text-ink-muted-80 dark:text-dark-muted truncate max-w-[280px] sm:max-w-md">
                  {part.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted-80 hover:bg-subtle hover:text-ink transition-colors dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close price history"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 px-6 py-4 border-b border-line dark:border-dark-line bg-canvas dark:bg-dark-surface text-center">
            <div>
              <span className="text-[11px] text-ink-muted-80 dark:text-dark-muted block">Current Best</span>
              <span className="text-base font-bold text-ink dark:text-white">RM{currentPrice}</span>
            </div>
            <div>
              <span className="text-[11px] text-ink-muted-80 dark:text-dark-muted block flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3 text-emerald-500" /> 30-Day Low
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">RM{minPrice}</span>
            </div>
            <div>
              <span className="text-[11px] text-ink-muted-80 dark:text-dark-muted block flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-rose-500" /> 30-Day High
              </span>
              <span className="text-base font-bold text-ink-muted-80 dark:text-dark-muted">RM{maxPrice}</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="space-y-3 py-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-subtle dark:bg-dark-subtle rounded animate-pulse" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted-80 dark:text-dark-muted">
                  Recorded Quotes Timeline
                </h3>
                <div className="divide-y divide-line dark:divide-dark-line border border-line rounded-[12px] overflow-hidden dark:border-dark-line">
                  {history.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-4 py-3 bg-canvas dark:bg-dark-surface text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-ink-muted-80 dark:text-dark-muted" aria-hidden="true" />
                        <span className="text-ink dark:text-white font-medium">{pt.date}</span>
                        <span className="text-[11px] text-ink-muted-80 dark:text-dark-muted">({pt.retailerName})</span>
                      </div>
                      <span className="font-bold text-ink dark:text-white">RM{pt.priceMyr}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-ink-muted-80 dark:text-dark-muted">
                No previous price records yet.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50 text-xs">
            <span className="text-ink-muted-80 dark:text-dark-muted">
              Live price tracking across Malaysian retailers
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

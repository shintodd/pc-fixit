"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PartItem } from "@/lib/parts/types";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: PartItem | null;
}

export default function PriceAlertModal({ isOpen, onClose, part }: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (part) {
      // Default to 10% below current price
      setTargetPrice(Math.round(part.bestPriceMyr * 0.9));
      setSuccess(false);
      setError(null);
    }
  }, [part]);

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

  if (!isOpen || !part) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || targetPrice <= 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/parts/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId: part.id,
          targetPriceMyr: targetPrice,
          userEmail: email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to set price alert.");
      }
    } catch (err: any) {
      setError(err.message || "Network error setting alert.");
    } finally {
      setSubmitting(false);
    }
  };

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
          aria-labelledby="alert-modal-title"
          className="relative w-full max-w-md rounded-[18px] bg-canvas border border-line shadow-2xl overflow-hidden dark:bg-dark-surface dark:border-dark-line"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="alert-modal-title" className="text-base font-semibold text-ink dark:text-white">
                  Set Price Drop Alert
                </h2>
                <p className="text-xs text-ink-muted-80 dark:text-dark-muted truncate max-w-[200px] sm:max-w-xs">
                  {part.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted-80 hover:bg-subtle hover:text-ink transition-colors dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close price alert dialog"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Form */}
          {success ? (
            <div className="p-8 text-center space-y-4">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink dark:text-white">Price Alert Active</h3>
                <p className="text-xs text-ink-muted-80 dark:text-dark-muted mt-1">
                  We will notify {email} the moment this part drops below RM{targetPrice} across tracked retailers.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-full bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors dark:bg-dark-accent dark:hover:bg-dark-accent-hover"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-[12px] bg-canvas-parchment/50 border border-line dark:bg-dark-subtle/30 dark:border-dark-line flex items-center justify-between">
                <span className="text-ink-muted-80 dark:text-dark-muted">Current Best Price:</span>
                <span className="font-bold text-sm text-ink dark:text-white">RM{part.bestPriceMyr}</span>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="target-price-input" className="font-medium text-ink dark:text-white">
                  Target Alert Price (MYR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted-80 dark:text-dark-muted font-medium">
                    RM
                  </span>
                  <input
                    id="target-price-input"
                    type="number"
                    min={1}
                    max={part.bestPriceMyr}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="user-email-input" className="font-medium text-ink dark:text-white">
                  Notification Email Address
                </label>
                <input
                  id="user-email-input"
                  type="email"
                  placeholder="tech@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-full border border-line bg-canvas text-ink dark:border-dark-line dark:bg-dark-surface dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>

              {error && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px]">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 dark:bg-dark-accent dark:hover:bg-dark-accent-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Setting Alert...
                  </>
                ) : (
                  "Create Price Alert"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

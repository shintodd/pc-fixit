"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Copy, Check, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PhoneQrModal({
  isOpen,
  onClose,
  title,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const activeUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const isMs = language === "ms";

  useEffect(() => {
    if (!isOpen || !activeUrl) return;

    QRCode.toDataURL(activeUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.warn("QR generation error:", err));
  }, [isOpen, activeUrl]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleCopy() {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="phone-qr-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="glass-element glass-adaptive relative w-full max-w-md p-6 sm:p-7 z-10 space-y-5 text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-line dark:border-dark-line">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent dark:text-dark-accent">
                <Smartphone className="h-4 w-4" />
              </div>
              <h2 id="qr-modal-title" className="text-base font-bold text-ink dark:text-dark-ink text-left">
                {isMs ? "Buka di Telefon Pintar" : "Open Guide on Your Phone"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-[13px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
            {isMs
              ? "Imbas kod QR ini menggunakan kamera telefon untuk teruskan baiki dengan PC dipadamkan."
              : "Scan this QR code with your phone camera so you can turn off and unplug your PC safely."}
          </p>

          {/* QR Code Container */}
          <div className="flex justify-center py-1">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-line/80 inline-block">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR Code for current page"
                  className="w-56 h-56 rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-ink-tertiary">
                  <QrCode className="h-12 w-12 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {title && (
            <div className="text-[12px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary truncate">
              {title}
            </div>
          )}

          {/* Copy Link Button */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-line dark:border-dark-line bg-subtle dark:bg-dark-subtle py-2.5 text-[13px] font-semibold text-ink dark:text-dark-ink hover:border-accent/40 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-ok" />
                  <span className="text-ok">{isMs ? "Pautan Disalin!" : "Link Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-ink-tertiary" />
                  <span>{isMs ? "Salin Pautan" : "Copy Link"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all"
            >
              {isMs ? "Tutup" : "Done"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}

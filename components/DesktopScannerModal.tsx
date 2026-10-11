"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  HardDrive,
  Cpu,
  Zap,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";

interface DesktopScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DesktopScannerModal({
  isOpen,
  onClose,
}: DesktopScannerModalProps) {
  const { language } = useLanguage();
  const [copiedSample, setCopiedSample] = useState(false);
  const isMs = language === "ms";

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    {
      icon: HardDrive,
      color: "text-rose-500 bg-rose-500/10",
      titleEn: "Storage Bad Block Event Hunter",
      titleMs: "Pengesan Bad Block Storan Fizikal",
      descEn:
        "Analyzes Event IDs 7, 51, and 153 to detect failing SSD/HDD sectors and directory corruption before catastrophic data loss occurs.",
      descMs:
        "Menganalisis Event ID 7, 51, dan 153 bagi mengesan sektor SSD/HDD rosak sebelum berlaku kegagalan cakera sepenuhnya.",
    },
    {
      icon: Cpu,
      color: "text-blue-500 bg-blue-500/10",
      titleEn: "Split-Boot Layout Detection",
      titleMs: "Pengesanan Susun Atur Split-Boot",
      descEn:
        "Detects when the EFI bootloader resides on Disk 0 while Windows OS resides on Disk 1, preventing boot failure if a secondary drive fails.",
      descMs:
        "Mengesan jika bootloader EFI berada di Disk 0 manakala Windows OS di Disk 1, mengelakkan isu tidak boleh boot jika satu cakera dicabut.",
    },
    {
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10",
      titleEn: "Native S.M.A.R.T. IOCTL Engine",
      titleMs: "Enjin S.M.A.R.T. IOCTL Terus",
      descEn:
        "Direct Win32 DeviceIoControl queries to read drive wear percentage, uncorrected errors, and health flags on SATA and NVMe drives.",
      descMs:
        "Panggilan DeviceIoControl Win32 terus bagi membaca peratus haus, ralat tidak diperbaiki, dan tahap kesihatan pemacu SATA dan NVMe.",
    },
    {
      icon: AlertTriangle,
      color: "text-purple-500 bg-purple-500/10",
      titleEn: "GPU PCIe Link Speed Validator",
      titleMs: "Pengesah Kelajuan Laluan PCIe GPU",
      descEn:
        "Reads SetupAPI properties to check if GPU PCIe width renegotiated from x16 down to x8 or x4 due to PCIe slot dust or GPU card sag.",
      descMs:
        "Membaca sifat SetupAPI untuk semak jika laluan PCIe GPU jatuh dari x16 ke x8 atau x4 akibat habuk slot atau kad grafik melendut.",
    },
    {
      icon: Terminal,
      color: "text-emerald-500 bg-emerald-500/10",
      titleEn: "Kernel-Power 41 Discriminator",
      titleMs: "Pemisah Punca Freeze Kernel-Power 41",
      descEn:
        "Parses Event 41 XML parameters to distinguish sudden PSU power trips from blue screen crashes and normal power button shutdowns.",
      descMs:
        "Menghuraikan parameter XML Event 41 untuk membezakan kuasa PSU terputus tiba-tiba dengan kerosakan skrin biru dan suis kuasa biasa.",
    },
    {
      icon: QrCode,
      color: "text-sky-500 bg-sky-500/10",
      titleEn: "Offline Pure Vector QR Bridge",
      titleMs: "Jambatan QR Vektor Luar Talian",
      descEn:
        "Generates a sharp vector QR code directly in the WPF UI to send hardware diagnostic findings to your phone without internet access.",
      descMs:
        "Menjana kod QR vektor tajam terus dalam tetingkap untuk hantar hasil diagnos ke telefon pintar tanpa memerlukan sambungan internet.",
    },
  ];

  const steps = [
    {
      step: "1",
      titleEn: "Download & Launch",
      titleMs: "Muat Turun & Buka",
      descEn:
        "Download pcfix-scanner.exe (180 KB). Zero installer, zero registry changes, runs portable as standard user.",
      descMs:
        "Muat turun pcfix-scanner.exe (180 KB). Tiada pemasang, tiada ubah registry, sedia jalan terus sebagai pengguna biasa.",
    },
    {
      step: "2",
      titleEn: "Run Instant Scan",
      titleMs: "Jalankan Imbasan Pantas",
      descEn:
        "Click Start Hardware Scan. Completed in 3 to 5 seconds across CPU, RAM, GPU, S.M.A.R.T, and Event Logs.",
      descMs:
        "Klik Mula Imbasan. Siap dalam 3 hingga 5 saat merangkumi CPU, RAM, GPU, S.M.A.R.T, dan Log Peristiwa Windows.",
    },
    {
      step: "3",
      titleEn: "Triage in pcfix AI",
      titleMs: "Triage dalam pcfix AI",
      descEn:
        "Click Copy Report or scan the QR code to paste results into pcfix AI Chat for instant tailored repair steps.",
      descMs:
        "Klik Salin Laporan atau imbas kod QR untuk tampal laporan ke Chat AI pcfix bagi penyelesaian segera.",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="desktop-scanner-title"
          className="relative w-full max-w-3xl my-6 rounded-2xl border border-line dark:border-dark-line bg-surface dark:bg-dark-surface shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line dark:border-dark-line p-4 sm:p-5 bg-subtle/40 dark:bg-dark-subtle/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Cpu className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="desktop-scanner-title"
                    className="text-base sm:text-lg font-bold text-ink dark:text-dark-ink"
                  >
                    {isMs ? "Pengimbas Hardware PC pcfix" : "pcfix Desktop Hardware Scanner"}
                  </h2>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    180 KB Portable
                  </span>
                </div>
                <p className="text-[12.5px] text-ink-secondary dark:text-dark-ink-secondary">
                  {isMs
                    ? "Alat diagnostik Windows tanpa pemasang - .NET 4.8 / Win 10 & 11"
                    : "Zero-install portable Windows companion - .NET 4.8 / Win 10 & 11"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={isMs ? "Tutup tetingkap" : "Close modal"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Primary Download Banner */}
            <div className="rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/5 via-sky-500/5 to-transparent dark:from-blue-500/10 dark:via-sky-500/10 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      {isMs ? "Disahkan Bersih" : "Verified Safe"}
                    </span>
                    <span className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                      pcfix-scanner.exe (179.5 KB)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink dark:text-dark-ink">
                    {isMs
                      ? "Muat Turun Pengimbas Hardware Bebas Pasang"
                      : "Download Standalone Hardware Scanner"}
                  </h3>
                  <p className="text-[13px] text-ink-secondary dark:text-dark-ink-secondary max-w-md">
                    {isMs
                      ? "Jalankan terus tanpa installer. Membaca ralat cakera, suhu CPU, kelajuan PCIe GPU, dan log kerosakan perkakasan."
                      : "Runs directly without setup. Reads disk bad blocks, CPU thermals, GPU PCIe link rate, and crash history."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <a
                    href="https://github.com/shintodd/pcfix-scanner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line-strong dark:border-dark-line-strong bg-white/80 dark:bg-dark-card/80 px-4 py-2.5 text-[13px] font-semibold text-ink dark:text-dark-ink hover:text-accent hover:border-accent/40 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{isMs ? "Kod Sumber GitHub" : "GitHub Source"}</span>
                  </a>

                  <a
                    href="/downloads/pcfix-scanner.exe"
                    download="pcfix-scanner.exe"
                    className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[14px] font-bold text-white shadow-md hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isMs ? "Muat Turun .EXE (180 KB)" : "Download .EXE (180 KB)"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Open Source Transparency & Client Trust */}
            <div className="rounded-xl border border-line dark:border-dark-line bg-card dark:bg-dark-card p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 dark:border-dark-line/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-ink dark:text-dark-ink">
                      {isMs ? "Jaminan Keselamatan & Kod Sumber Terbuka" : "Open Source & Client Trust Guarantee"}
                    </h4>
                    <p className="text-[11.5px] text-ink-tertiary dark:text-dark-ink-tertiary">
                      {isMs ? "Audit setiap baris kod sumber secara telus di GitHub." : "Audit every single line of code transparently on GitHub."}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  MIT License
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[12px]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-ink-secondary dark:text-dark-ink-secondary">
                    {isMs ? "100% kod C# 5.0 dalam 1 fail tunggal (Program.cs)" : "100% C# 5.0 in single file (Program.cs)"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-ink-secondary dark:text-dark-ink-secondary">
                    {isMs ? "Panggilan baca sahaja: sifar telemetri internet" : "Read-only calls: zero telemetry sent"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-ink-secondary dark:text-dark-ink-secondary">
                    {isMs ? "Kompilasi terus dengan csc.exe Windows" : "Compiles natively with Windows csc.exe"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Step Workflow */}
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary mb-3">
                {isMs ? "Cara Menggunakan" : "How It Works"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {steps.map((st) => (
                  <div
                    key={st.step}
                    className="rounded-xl border border-line dark:border-dark-line bg-card dark:bg-dark-card p-3.5 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
                        {st.step}
                      </span>
                      <span className="text-[13px] font-semibold text-ink dark:text-dark-ink">
                        {isMs ? st.titleMs : st.titleEn}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                      {isMs ? st.descMs : st.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 Diagnostic Capabilities */}
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary mb-3">
                {isMs ? "Ciri-Ciri Diagnostik Mendalam" : "Deep Forensic Telemetry"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-line dark:border-dark-line bg-card dark:bg-dark-card p-3.5 flex items-start gap-3"
                    >
                      <div className={`p-2 rounded-lg ${feat.color} shrink-0 mt-0.5`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-[13px] font-semibold text-ink dark:text-dark-ink">
                          {isMs ? feat.titleMs : feat.titleEn}
                        </div>
                        <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                          {isMs ? feat.descMs : feat.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fast Handoff to AI Chat */}
            <div className="rounded-xl border border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="text-[13.5px] font-bold text-ink dark:text-dark-ink">
                  {isMs
                    ? "Sudah ada laporan pengimbas?"
                    : "Already have a scanner report?"}
                </div>
                <div className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary">
                  {isMs
                    ? "Tampal terus teks laporan ke dalam Chat AI untuk analisis menyeluruh."
                    : "Paste the raw findings into AI Chat for instant root-cause analysis."}
                </div>
              </div>

              <Link
                href="/troubleshoot"
                onClick={onClose}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-ink dark:bg-white px-4 py-2 text-[13px] font-semibold text-white dark:text-ink hover:opacity-90 transition-opacity shrink-0"
              >
                <span>{isMs ? "Buka Chat AI" : "Open AI Chat"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-line dark:border-dark-line px-4 sm:px-5 py-3 bg-subtle/30 dark:bg-dark-subtle/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-ink-tertiary dark:text-dark-ink-tertiary shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {isMs
                  ? "Tiada pemacu dipasang. Data perkakasan kekal dalam komputer anda."
                  : "No drivers installed. All diagnostic telemetry stays on your local machine."}
              </span>
            </div>
            <div>Build: 2026-10-11 (C# 5.0 / .NET 4.8)</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

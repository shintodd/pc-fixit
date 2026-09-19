"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Copy, Check, ShieldAlert, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DiagnosticCommand {
  id: string;
  name: string;
  command: string;
  runAsAdmin: boolean;
  purposeEn: string;
  purposeMs: string;
  goodOutputEn: string;
  goodOutputMs: string;
  badOutputEn: string;
  badOutputMs: string;
  nextStepEn: string;
  nextStepMs: string;
}

const COMMANDS: DiagnosticCommand[] = [
  {
    id: "sfc",
    name: "System File Checker (SFC)",
    command: "sfc /scannow",
    runAsAdmin: true,
    purposeEn: "Scans all protected Windows files and replaces corrupted files with fresh copies.",
    purposeMs: "Mengimbas fail sistem Windows yang rosak dan menggantikannya dengan salinan elok.",
    goodOutputEn: "Windows Resource Protection did not find any integrity violations (or 'found corrupt files and successfully repaired them').",
    goodOutputMs: "'did not find any integrity violations' atau 'successfully repaired them' bermaksud fail sistem kini bersih.",
    badOutputEn: "'Windows Resource Protection found corrupt files but was unable to fix some of them.'",
    badOutputMs: "'unable to fix some of them' bermaksud fail rosak terlalu teruk. Jalankan arahan DISM seterusnya.",
    nextStepEn: "If corrupted files could not be fixed, run the DISM command below next.",
    nextStepMs: "Jika SFC tak dapat baiki, jalankan arahan DISM di bawah.",
  },
  {
    id: "dism",
    name: "DISM Image Health Repair",
    command: "DISM /Online /Cleanup-Image /RestoreHealth",
    runAsAdmin: true,
    purposeEn: "Downloads clean replacement system components directly from Windows Update servers.",
    purposeMs: "Muat turun komponen sistem Windows yang bersih terus dari server rasmi Microsoft.",
    goodOutputEn: "'The restore operation completed successfully. 100%'",
    goodOutputMs: "'The restore operation completed successfully' tanda pembaikan berjaya.",
    badOutputEn: "'Error: 0x800f081f - The source files could not be found.'",
    badOutputMs: "'The source files could not be found' biasanya disebabkan tiada sambungan internet.",
    nextStepEn: "After DISM finishes, run 'sfc /scannow' one more time to complete the repair.",
    nextStepMs: "Lepas DISM siap 100%, jalankan 'sfc /scannow' sekali lagi untuk sahkan.",
  },
  {
    id: "network-reset",
    name: "Flush DNS & Reset Network Stack",
    command: "ipconfig /flushdns && netsh winsock reset",
    runAsAdmin: true,
    purposeEn: "Clears stuck DNS cache and resets Windows network sockets to resolve 'Connected, no internet'.",
    purposeMs: "Kosongkan cache DNS dan reset sambungan rangkaian untuk selesaikan isu 'No Internet'.",
    goodOutputEn: "'Successfully flushed the DNS Resolver Cache. You must restart the computer.'",
    goodOutputMs: "'Successfully flushed' dan 'You must restart the computer'.",
    badOutputEn: "'Could not flush the DNS Resolver Cache: Function failed.'",
    badOutputMs: "'Function failed' biasanya jika Command Prompt tidak dibuka sebagai Administrator.",
    nextStepEn: "Restart your PC immediately after running this command.",
    nextStepMs: "Restart PC anda serta-merta selepas menjalankan arahan ini.",
  },
  {
    id: "memory-diag",
    name: "Windows Memory Diagnostic (RAM Test)",
    command: "mdsched.exe",
    runAsAdmin: true,
    purposeEn: "Triggers built-in hardware test on reboot to detect unstable or faulty RAM sticks.",
    purposeMs: "Jalankan ujian perkakasan memori RAM waktu restart untuk kesan cip memori rosak.",
    goodOutputEn: "Blue-screen test runs upon restart; Windows reports 'No memory errors were detected'.",
    goodOutputMs: "Ujian skrin biru berjalan semasa restart; tiada ralat memori dilaporkan.",
    badOutputEn: "'Hardware problems were detected. To identify and repair these problems, contact...'",
    badOutputMs: "'Hardware problems were detected' bermakna satu atau lebih kepingan RAM anda rosak.",
    nextStepEn: "If errors are found, test each RAM stick individually to find the bad stick.",
    nextStepMs: "Jika ada ralat dikesan, uji satu demi satu kepingan RAM untuk cari punca.",
  },
];

export default function CommandExplainerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [selectedCmd, setSelectedCmd] = useState(COMMANDS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isMs = language === "ms";

  function handleCopy(cmd: DiagnosticCommand) {
    navigator.clipboard.writeText(cmd.command);
    setCopiedId(cmd.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Close on Escape key
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
        <motion.div
          key="cmd-explainer-modal"
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
          aria-labelledby="cmd-modal-title"
          className="glass-element glass-adaptive relative w-full max-w-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:text-dark-accent">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h2 id="cmd-modal-title" className="text-lg font-bold text-ink dark:text-dark-ink">
                  {isMs ? "Arahan Pembaikan Windows & Maksud Keputusan" : "Windows Repair Commands & Output Decoder"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Salin arahan dengan 1-klik dan fahami apa maksud teks keputusan yang keluar."
                    : "1-click copy verified repair commands and understand what the terminal output means."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Command Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            {COMMANDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCmd(c)}
                className={`min-h-[44px] flex flex-col justify-center p-2.5 rounded-xl border text-left text-[12px] font-semibold transition-all ${
                  selectedCmd.id === c.id
                    ? "border-accent ring-2 ring-accent/20 bg-accent-soft/30 dark:bg-dark-accent/15 text-accent dark:text-dark-accent"
                    : "border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 hover:bg-subtle text-ink-secondary dark:text-dark-ink-secondary"
                }`}
              >
                <span className="font-mono text-[11px] truncate">{c.command.split(" ")[0]}</span>
                <span className="text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary truncate">{c.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Selected Command Details */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-[13px]">
            {/* Command Copy Box */}
            <div className="rounded-2xl border border-line dark:border-dark-line bg-slate-950 p-4 text-white space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-ok font-bold">&gt;</span>
                  <span>{isMs ? "Jalankan dalam Command Prompt (Admin)" : "Run in Command Prompt (Admin)"}</span>
                </div>
                {selectedCmd.runAsAdmin && (
                  <span className="rounded bg-accent/20 text-accent px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    Admin Required
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <code className="font-mono text-[14px] text-accent dark:text-dark-accent select-all break-all">
                  {selectedCmd.command}
                </code>

                <button
                  type="button"
                  onClick={() => handleCopy(selectedCmd)}
                  className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 rounded-pill bg-white/10 hover:bg-white/20 px-3.5 py-2 text-[12px] font-semibold text-white transition-all active:scale-95"
                  aria-label={isMs ? "Salin arahan" : "Copy command"}
                >
                  {copiedId === selectedCmd.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-ok" />
                      <span className="text-ok">{isMs ? "Disalin!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{isMs ? "Salin" : "Copy"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
                {isMs ? "Tujuan Arahan Ini:" : "What This Does:"}
              </span>
              <p className="text-ink dark:text-dark-ink leading-relaxed">
                {isMs ? selectedCmd.purposeMs : selectedCmd.purposeEn}
              </p>
            </div>

            {/* Output Decoders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Good Output */}
              <div className="rounded-2xl border border-ok/30 bg-ok/5 dark:bg-ok/10 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-ok font-bold text-[12px]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isMs ? "Keputusan Bersih (Lulus):" : "Clean Output (Passed):"}</span>
                </div>
                <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                  {isMs ? selectedCmd.goodOutputMs : selectedCmd.goodOutputEn}
                </p>
              </div>

              {/* Bad Output */}
              <div className="rounded-2xl border border-critical/30 bg-critical/5 dark:bg-critical/10 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-critical font-bold text-[12px]">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isMs ? "Jika Keluar Teks Ini (Ralat):" : "If Output Shows This (Failed):"}</span>
                </div>
                <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                  {isMs ? selectedCmd.badOutputMs : selectedCmd.badOutputEn}
                </p>
              </div>
            </div>

            {/* Next Step Note */}
            <div className="rounded-xl bg-subtle/50 dark:bg-dark-subtle/50 p-3 text-[12px] text-ink-secondary dark:text-dark-ink-secondary flex items-start gap-2">
              <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>{isMs ? selectedCmd.nextStepMs : selectedCmd.nextStepEn}</span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-line dark:border-dark-line flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-pill bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all flex items-center justify-center"
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

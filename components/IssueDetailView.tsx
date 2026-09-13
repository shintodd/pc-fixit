"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  MessageSquare,
  Sparkles,
  Share2,
  ShieldAlert,
  Smartphone,
  Printer,
  Volume2,
  VolumeX,
  Clock,
  Wrench,
  ShieldCheck,
  Monitor,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import { type IssueDetail, type Severity } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import PhoneQrModal from "@/components/PhoneQrModal";
import PortLocatorModal from "@/components/PortLocatorModal";
import JargonTooltip, { type JargonTerm } from "@/components/JargonTooltip";

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-critical/10 text-critical border-critical/20",
  warn: "bg-warn/10 text-warn border-warn/20",
  info: "bg-accent/10 text-accent border-accent/20",
};

export default function IssueDetailView({ issue }: { issue: IssueDetail }) {
  const { t, language } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPortModal, setShowPortModal] = useState(false);
  const [solvedAtStep, setSolvedAtStep] = useState<number | null>(null);

  const isMs = language === "ms";

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleStep(index: number) {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: issue.title,
          text: issue.summary,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard if user cancels or share fails
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function speakStep(index: number, text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = isMs ? "id-ID" : "en-US"; // id-ID widely available for Malay phonetic speech

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  }

  const getSeverityLabel = (severity: Severity) => {
    switch (severity) {
      case "critical":
        return isMs ? "Kerosakan Kritikal" : "Critical Issue";
      case "warn":
        return isMs ? "Masalah Biasa" : "Common Problem";
      case "info":
        return isMs ? "Isu Ringan" : "Minor Glitch";
      default:
        return severity;
    }
  };

  const allDone =
    issue.steps.length > 0 && (completedSteps.length === issue.steps.length || solvedAtStep !== null);

  // Helper to highlight jargon words in text
  function renderTextWithJargon(text: string) {
    const jargonWords = ["RAM", "GPU", "PSU", "BIOS", "CMOS", "POST", "SSD", "DisplayPort", "HDMI"];
    const regex = new RegExp(`\\b(${jargonWords.join("|")})\\b`, "g");
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (jargonWords.includes(part)) {
        return <JargonTooltip key={idx} term={part as JargonTerm}>{part}</JargonTooltip>;
      }
      return part;
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1720px] flex-1 px-4 sm:px-8 lg:px-12 2xl:px-16 py-8 sm:py-14">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          header, footer, aside, nav, button, .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-clean {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            background: transparent !important;
          }
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Main Content Column */}
        <div className="flex-1 min-w-0 w-full">
          {/* Breadcrumb & Quick Action Bar */}
          <div className="mb-6 flex items-center justify-between no-print flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary transition-colors hover:text-ink dark:hover:text-dark-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("issue_all_guides")}</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="hidden sm:inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-card px-3 py-1.5 text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary transition-colors hover:text-ink dark:hover:text-dark-ink shadow-xs"
                title={t("tool_phone_qr")}
              >
                <Smartphone className="h-3.5 w-3.5 text-accent" />
                <span>{t("tool_phone_qr")}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPortModal(true)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-card px-3 py-1.5 text-[12px] font-medium whitespace-nowrap text-ink-secondary dark:text-dark-ink-secondary transition-colors hover:text-ink dark:hover:text-dark-ink shadow-xs"
                title={t("tool_port_locator")}
              >
                <Monitor className="h-3.5 w-3.5 text-blue-500" />
                <span>{t("tool_port_locator")}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-card px-3 py-1.5 text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary transition-colors hover:text-ink dark:hover:text-dark-ink shadow-xs"
                title={t("print_cheat_sheet")}
              >
                <Printer className="h-3.5 w-3.5 text-ink-tertiary" />
                <span>{t("print_cheat_sheet")}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label={copied ? t("issue_copied_link") : t("issue_share")}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line dark:border-dark-line bg-surface dark:bg-dark-card px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-ink-secondary dark:text-dark-ink-secondary transition-colors hover:text-ink dark:hover:text-dark-ink shadow-xs active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                    <span className="text-ok">{t("issue_copied_link")}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t("issue_share")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${
                  SEVERITY_STYLE[(issue.severity as Severity) || "warn"] || SEVERITY_STYLE.warn
                }`}
              >
                {getSeverityLabel((issue.severity as Severity) || "warn")}
              </span>

              {/* Tools & Time Badges */}
              <span className="inline-flex items-center gap-1 rounded-pill bg-subtle dark:bg-dark-subtle px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary dark:text-dark-ink-secondary border border-line/60 dark:border-dark-line">
                <Clock className="h-3 w-3 text-accent" />
                <span>{t("time_estimate_default")}</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-pill bg-subtle dark:bg-dark-subtle px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary dark:text-dark-ink-secondary border border-line/60 dark:border-dark-line">
                <Wrench className="h-3 w-3 text-accent" />
                <span>{t("tools_required_none")}</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-pill bg-ok/10 text-ok px-2.5 py-0.5 text-[11px] font-semibold border border-ok/20">
                <ShieldCheck className="h-3 w-3" />
                <span>{t("risk_level_zero")}</span>
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink dark:text-dark-ink sm:text-4xl">
              {issue.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary dark:text-dark-ink-secondary sm:text-lg">
              {renderTextWithJargon(issue.summary)}
            </p>
          </motion.div>

          {/* Safety Reassurance Banner */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="mt-6 rounded-2xl border border-ok/30 bg-ok/5 dark:bg-ok/10 p-4 sm:p-5 text-[13px] text-ink dark:text-dark-ink flex items-start gap-3.5 shadow-xs"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ok/15 text-ok">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-ok text-[14px]">{t("safety_banner_title")}</div>
              <p className="text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                {t("safety_banner_desc")}
              </p>
            </div>
          </motion.div>

          {/* Common Symptoms */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="mt-8 rounded-2xl border border-line dark:border-dark-line bg-subtle/70 dark:bg-dark-subtle/70 p-5 backdrop-blur-xs print-clean"
          >
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
              {t("issue_common_symptoms")}
            </h2>
            <ul className="mt-3 space-y-2">
              {issue.symptoms.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[14px] text-ink dark:text-dark-ink">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span className="break-words [overflow-wrap:anywhere]">{renderTextWithJargon(s)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Interactive Step-by-Step Fix Checklist */}
          <div className="mt-10">
            <div className="space-y-2 pb-3 border-b border-line dark:border-dark-line">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
                  {t("issue_checklist_title")}
                </h2>
                <span className="text-[12px] font-semibold text-accent dark:text-dark-accent">
                  {isMs
                    ? `${completedSteps.length} daripada ${issue.steps.length} langkah selesai`
                    : `${completedSteps.length} of ${issue.steps.length} steps completed`}
                </span>
              </div>

              {/* Animated Checklist Progress Bar */}
              <div
                role="progressbar"
                aria-valuenow={Math.round((completedSteps.length / (issue.steps.length || 1)) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Fix checklist progress"
                className="h-1.5 w-full overflow-hidden rounded-full bg-subtle dark:bg-dark-subtle no-print"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.round((completedSteps.length / (issue.steps.length || 1)) * 100)}%`,
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-ok rounded-full"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {issue.steps.map((step, i) => {
                const isDone = completedSteps.includes(i);
                const isSpeaking = speakingIndex === i;

                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 select-none shadow-xs print-clean ${
                      isDone
                        ? "border-ok/30 bg-ok/5 dark:bg-ok/10"
                        : "border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => toggleStep(i)}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                          isDone
                            ? "bg-ok text-white shadow-xs"
                            : "border border-line-strong dark:border-dark-line-strong text-ink-tertiary dark:text-dark-ink-tertiary hover:border-accent hover:text-accent"
                        }`}
                        aria-label={`Mark step ${i + 1} as completed`}
                      >
                        {isDone ? (
                          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                        ) : (
                          <span className="text-[11px] font-semibold">{i + 1}</span>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={`text-[15px] font-semibold transition-colors break-words [overflow-wrap:anywhere] ${
                              isDone ? "text-ink dark:text-dark-ink line-through opacity-60" : "text-ink dark:text-dark-ink"
                            }`}
                          >
                            {step.title}
                          </h3>

                          {/* Voice Readout Button */}
                          <button
                            type="button"
                            onClick={() => speakStep(i, `${step.title}. ${step.detail}`)}
                            className="no-print p-1 text-ink-tertiary hover:text-accent rounded-md transition-colors"
                            title={isSpeaking ? t("voice_stop") : t("voice_read_step")}
                            aria-label={isSpeaking ? t("voice_stop") : t("voice_read_step")}
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-4 w-4 text-critical animate-pulse" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <p
                          className={`mt-1.5 text-[14px] leading-relaxed transition-opacity break-words [overflow-wrap:anywhere] ${
                            isDone ? "text-ink-secondary/60 dark:text-dark-ink-secondary/60" : "text-ink-secondary dark:text-dark-ink-secondary"
                          }`}
                        >
                          {renderTextWithJargon(step.detail)}
                        </p>

                        {/* Interactive Step Branching Buttons */}
                        <div className="mt-3.5 pt-3 border-t border-line/50 dark:border-dark-line/50 flex flex-wrap items-center gap-2 no-print">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isDone) toggleStep(i);
                              setSolvedAtStep(i + 1);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 hover:bg-ok/20 text-ok px-3 py-1.5 text-[12px] font-semibold transition-colors"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{t("btn_it_worked")}</span>
                          </button>

                          {i < issue.steps.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!isDone) toggleStep(i);
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-line dark:border-dark-line bg-white dark:bg-dark-card hover:bg-subtle px-3 py-1.5 text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary transition-colors"
                            >
                              <span>{t("btn_still_broken")}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Solved Celebration Box */}
            {allDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="mt-6 flex items-start sm:items-center gap-3.5 rounded-2xl border border-ok/30 bg-ok/10 p-5 text-ok shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ok text-white shadow-xs">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-ink dark:text-dark-ink text-[15px]">
                    {solvedAtStep !== null
                      ? (isMs ? `Berjaya dibaiki pada Langkah ${solvedAtStep}!` : `Fixed successfully at Step ${solvedAtStep}!`)
                      : (isMs ? "Semua langkah dah siap dicuba!" : "All troubleshooting steps completed!")}
                  </div>
                  <div className="text-[13px] text-ink-secondary dark:text-dark-ink-secondary mt-0.5">
                    {isMs
                      ? "Komputer anda dah kembali elok. Jangan lupa restart sekali untuk pastikan kestabilan."
                      : "Your PC is back in action! Reboot once to verify permanent stability."}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Still Stuck Call to Action */}
          <div className="mt-14 rounded-2xl border border-line-strong dark:border-dark-line-strong bg-white dark:bg-dark-card p-6 shadow-card dark:shadow-card-dark no-print">
            <div className="flex items-center gap-2 text-accent dark:text-dark-accent">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className="text-[12px] font-semibold uppercase tracking-wider">
                {isMs ? "Perlukan Bantuan Tambahan?" : "Need Live Assistance?"}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-ink dark:text-dark-ink">
              {isMs ? "PC masih tak elok lagi?" : "Still having trouble with your PC?"}
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
              {isMs
                ? "Ceritakan apa yang berlaku pada Technician AI kami. Tech akan bagi langkah khusus ikut komponen dan model komputer anda."
                : "Describe what is happening to your AI Technician. We will tailor the fix to your exact hardware setup."}
            </p>

            <div className="mt-5">
              <Link
                href={`/troubleshoot?q=${encodeURIComponent(
                  isMs
                    ? `Saya dah cuba panduan "${issue.title}", tapi masalah masih tak selesai.`
                    : `I followed the guide for "${issue.title}", but it is still not working.`
                )}`}
                className="inline-flex items-center gap-2 rounded-pill bg-accent hover:bg-accent-hover dark:bg-accent dark:hover:bg-accent-hover px-5 py-2.5 text-[14px] font-medium text-white transition-all active:scale-95 shadow-sm shadow-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>{isMs ? "Tanya Technician AI" : "Ask AI Technician"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sticky Desktop Technical Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 gap-5 sticky top-24 no-print">
          <div className="rounded-2xl border border-line dark:border-dark-line bg-white/85 dark:bg-dark-card/85 p-6 shadow-card dark:shadow-card-dark backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-line dark:border-dark-line">
              <span className="text-[12px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
                {isMs ? "Ringkasan Masalah" : "Diagnostic Brief"}
              </span>
              <span
                className={`rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${
                  SEVERITY_STYLE[(issue.severity as Severity) || "warn"] || SEVERITY_STYLE.warn
                }`}
              >
                {getSeverityLabel((issue.severity as Severity) || "warn")}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary dark:text-dark-ink-secondary">
                  {isMs ? "Status Langkah Baiki" : "Checklist Progress"}
                </span>
                <span className="font-semibold text-accent dark:text-dark-accent">
                  {completedSteps.length} / {issue.steps.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle dark:bg-dark-subtle">
                <div
                  className="h-full bg-accent dark:bg-dark-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((completedSteps.length / (issue.steps.length || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-ink-secondary dark:text-dark-ink-secondary">
                  {isMs ? "Kategori" : "Category"}
                </span>
                <span className="font-semibold text-ink dark:text-dark-ink capitalize">
                  {(issue.category_slug || "hardware").replace("-", " ")}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-line dark:border-dark-line space-y-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line dark:border-dark-line bg-subtle/60 dark:bg-dark-subtle/60 py-2.5 text-[13px] font-semibold text-ink dark:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle transition-colors"
              >
                <Smartphone className="h-4 w-4 text-accent" />
                <span>{t("tool_phone_qr")}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line dark:border-dark-line bg-subtle/60 dark:bg-dark-subtle/60 py-2.5 text-[13px] font-semibold text-ink dark:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-ok" /> : <Share2 className="h-4 w-4" />}
                <span>
                  {copied ? (isMs ? "Pautan Disalin!" : "Link Copied!") : (isMs ? "Kongsi Panduan" : "Share Guide")}
                </span>
              </button>
            </div>
          </div>

          {issue.related_error_codes && issue.related_error_codes.length > 0 && (
            <div className="rounded-2xl border border-line dark:border-dark-line bg-white/85 dark:bg-dark-card/85 p-5 shadow-card dark:shadow-card-dark backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary block mb-3">
                {isMs ? "Kod Error Windows Berkaitan" : "Related Windows Error Codes"}
              </span>
              <div className="flex flex-wrap gap-2">
                {issue.related_error_codes.map((code) => (
                  <span
                    key={code}
                    className="font-mono text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-subtle dark:bg-dark-subtle text-ink dark:text-dark-ink border border-line/60 dark:border-dark-line/60"
                  >
                    Code {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-line/80 dark:border-dark-line/80 bg-subtle/60 dark:bg-dark-subtle/60 p-4 text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-dark-ink">
              <ShieldAlert className="h-3.5 w-3.5 text-warn" />
              <span>{isMs ? "Peringatan Keselamatan" : "Diagnostic Caution"}</span>
            </div>
            <p>
              {isMs
                ? "Jangan sesekali cabut atau pasang komponen (RAM, GPU, CPU) semasa plug elektrik masih terpasang kat suis dinding. Pastikan switch off dan cabut kabel power dulu!"
                : "Never disconnect or re-seat hardware components (RAM, GPU, CPU) while the power supply is connected to AC power."}
            </p>
          </div>
        </aside>
      </div>

      {/* Embedded Modals */}
      <PhoneQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={issue.title}
      />
      <PortLocatorModal
        isOpen={showPortModal}
        onClose={() => setShowPortModal(false)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  MessageSquare,
  FileText,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  WIZARD_TREE,
  type WizardOption,
  type WizardStep,
  type WizardResolvedIssue,
} from "@/lib/wizard-data";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const WIZARD_TRANSLATIONS_MS: Record<
  string,
  {
    question: string;
    options: Record<string, string>;
  }
> = {
  start: {
    question: "Apa yang berlaku pada PC anda?",
    options: {
      "It won't turn on, POST, or boot into Windows": "PC tak boleh hidup, tiada POST, atau gagal masuk ke Windows",
      "It crashes with a Blue Screen of Death (BSOD)": "Sistem crash dengan Skrin Biru Kematian (BSOD)",
      "It turns on, but runs sluggish, hitches, or freezes": "PC hidup, tapi sangat perlahan, tersekat-sekat, atau hang",
      "Internet, Wi-Fi, or Ethernet connection is failing": "Sambungan Internet, Wi-Fi, atau kabel LAN terputus",
      "Fans are roaring, PC is overheating, or shutting down from heat": "Kipas menderu bising, PC panas melampau, atau padam mengejut",
      "A graphics card, audio, or peripheral driver is malfunctioning": "Driver kad grafik, audio, atau peranti USB bermasalah",
    },
  },
  "wizard-wont-boot-power": {
    question: "Apa berlaku bila anda tekan butang kuasa (power)?",
    options: {
      "Completely dead (zero lights, zero fan movement)": "Mati sepenuhnya (tiada lampu, tiada putaran kipas)",
      "Fans spin for half a second then immediately shut off": "Kipas berpusing sekejap setengah saat terus padam",
      "Lights and fans turn on, but the display stays completely blank": "Lampu dan kipas hidup, tetapi monitor kekal gelap tiada paparan",
      "Shows the motherboard or Windows logo, but then freezes or loops": "Keluar logo motherboard atau Windows, lepas tu hang atau reboot berulang",
    },
  },
  "wizard-wont-boot-debug-led": {
    question: "Adakah motherboard menunjukkan sebarang lampu LED debug atau bunyi beep?",
    options: {
      "The CPU debug LED is illuminated (red or white)": "Lampu debug CPU menyala (merah atau putih)",
      "The DRAM debug LED is illuminated (yellow or amber)": "Lampu debug DRAM menyala (kuning atau jingga)",
      "The VGA debug LED is lit, or monitor says 'No Signal'": "Lampu debug VGA menyala, atau monitor tulis 'No Signal'",
      "The BOOT LED is lit, or the PC boots directly into the BIOS menu": "Lampu debug BOOT menyala, atau PC terus masuk ke menu BIOS",
    },
  },
  "wizard-wont-boot-freeze": {
    question: "Di manakah sangkutan (freeze) itu berlaku?",
    options: {
      "Frozen on the motherboard logo with stuck spinning dots": "Tersangkut pada logo motherboard dengan titik pusingan beku",
      "Stuck in a 'Preparing Automatic Repair' diagnostic loop": "Tersangkut dalam gelung 'Preparing Automatic Repair'",
    },
  },
  "wizard-bsod-timing": {
    question: "Bilakah skrin biru (BSOD) biasanya berlaku?",
    options: {
      "During Windows startup before the login screen appears": "Semasa boot Windows sebelum skrin login keluar",
      "Randomly during desktop usage or web browsing": "Bila-bila masa secara rawak semasa melayari web atau guna aplikasi",
      "Specifically while launching or playing heavy 3D games": "Khususnya semasa buka atau sedang bermain game 3D berat",
      "Right after installing a new Windows update or device driver": "Tepat selepas memasang kemas kini Windows atau driver baru",
    },
  },
  "wizard-slow-pattern": {
    question: "Apakah corak utama masalah perlahan atau hang ini?",
    options: {
      "Disk usage is locked at 100% in Task Manager": "Penggunaan cakera (Disk) terkunci pada 100% dalam Task Manager",
      "CPU frequency is severely throttled (e.g. locked at 0.79 GHz)": "Kelajuan CPU dipendekkan teruk (cth. terkunci pada 0.79 GHz)",
      "High CPU usage by Windows Update or background services": "Penggunaan CPU tinggi oleh Windows Update atau perkhidmatan latar",
      "Complete system freeze requiring a hard power reset": "Sistem beku sepenuhnya sehingga perlu tekan butang tutup paksa",
    },
  },
  "wizard-network-type": {
    question: "Apakah masalah sambungan rangkaian yang anda hadapi?",
    options: {
      "Wi-Fi shows connected but says 'No Internet' (APIPA 169.254)": "Wi-Fi bersambung tapi tulis 'No Internet' (APIPA 169.254)",
      "Browser reports 'DNS server not responding' or site not found": "Pelayar web melaporkan 'DNS server not responding'",
      "Default gateway is not available with yellow warning icon": "Default gateway tidak tersedia dengan ikon amaran kuning",
      "Ethernet connection constantly drops and reconnects": "Sambungan kabel LAN kerap putus dan bersambung semula",
    },
  },
  "wizard-thermal-symptom": {
    question: "Apakah tanda utama masalah kepanasan PC anda?",
    options: {
      "PC abruptly shuts off without warning during heavy gaming": "PC padam mengejut tanpa amaran semasa bermain game berat",
      "CPU temperature immediately spikes to 95C - 100C even on idle": "Suhu CPU melonjak serta-merta ke 95C - 100C walaupun masa idle",
      "GPU memory or hotspot temperature throttling performance": "Suhu memori GPU atau hotspot panas lampau menyebabkan lag",
      "Case fans are running at 100% jet-engine speed constantly": "Kipas casing berpusing 100% kelajuan enjin jet berterusan",
    },
  },
  "wizard-driver-device": {
    question: "Komponen atau peranti mana yang mengalami masalah driver?",
    options: {
      "Display flickers black or GPU driver crashes (Code 43 / TDR)": "Skrin berkelip hitam atau driver GPU terhempas (Kod 43 / TDR)",
      "Front panel 3.5mm headphone jack produces no audio": "Bicu fon kepala 3.5mm panel hadapan tiada bunyi",
      "USB device draws too much power or port surge detected": "Peranti USB menarik arus berlebihan atau dikesan lonjakan kuasa",
      "Bluetooth or Wi-Fi adapter shows Code 10 in Device Manager": "Penyesuai Bluetooth atau Wi-Fi menunjukkan Kod 10 dalam Device Manager",
    },
  },
};

export default function Wizard({
  initialTree,
  resolutions = {},
}: {
  initialTree?: Record<string, WizardStep>;
  resolutions?: Record<string, WizardResolvedIssue>;
}) {
  const { t, language } = useLanguage();
  const tree = initialTree || WIZARD_TREE;
  const [path, setPath] = useState<string[]>(["start"]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [slugHistory, setSlugHistory] = useState<(string | null)[]>([null]);

  const currentId = path[path.length - 1];
  const step = tree[currentId];
  const resolvedSlug = slugHistory[slugHistory.length - 1];
  const resolvedIssue = resolvedSlug ? resolutions[resolvedSlug] : null;

  function getLocalizedQuestion(nodeId: string, defaultQ: string): string {
    if (language === "ms" && WIZARD_TRANSLATIONS_MS[nodeId]) {
      return WIZARD_TRANSLATIONS_MS[nodeId].question;
    }
    return defaultQ;
  }

  function getLocalizedOptionLabel(nodeId: string, defaultLabel: string): string {
    if (language === "ms" && WIZARD_TRANSLATIONS_MS[nodeId]?.options[defaultLabel]) {
      return WIZARD_TRANSLATIONS_MS[nodeId].options[defaultLabel];
    }
    return defaultLabel;
  }

  function choose(opt: WizardOption) {
    const chosenLabel = getLocalizedOptionLabel(currentId, opt.label);
    setAnswers((a) => [...a, chosenLabel]);
    const currentSlug = slugHistory[slugHistory.length - 1];
    const newSlug = opt.resolves_to_issue_slug || currentSlug || null;
    setSlugHistory((s) => [...s, newSlug]);

    if (opt.next && tree[opt.next]) {
      const nextStep = opt.next;
      setPath((p) => [...p, nextStep]);
    } else {
      setPath((p) => [...p, "__end"]);
    }
  }

  function goBack() {
    if (path.length <= 1) return;
    setPath((p) => p.slice(0, -1));
    setAnswers((a) => a.slice(0, -1));
    setSlugHistory((s) => s.slice(0, -1));
  }

  function reset() {
    setPath(["start"]);
    setAnswers([]);
    setSlugHistory([null]);
  }

  const isEnd = currentId === "__end";
  const stepNumber = path.length;
  const progressPercent = Math.min(100, Math.round((stepNumber / (isEnd ? stepNumber : 4)) * 100));

  return (
    <div className="mx-auto w-full max-w-6xl 2xl:max-w-[1500px] flex-1 px-4 sm:px-8 lg:px-12 2xl:px-16 py-8 sm:py-14">
      {/* Top Header & Progress */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary">
            {isEnd ? t("wizard_complete_badge") : t("wizard_step_indicator", { step: stepNumber })}
          </span>

          <div className="flex items-center gap-3">
            {path.length > 1 && !isEnd && (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("wizard_back_btn")}</span>
              </button>
            )}
            {path.length > 1 && (
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 text-[13px] font-medium text-accent dark:text-dark-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("wizard_restart_btn")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={language === "ms" ? "Kemajuan diagnostik" : "Diagnostic progress"}
          className="h-1.5 w-full overflow-hidden rounded-full bg-subtle dark:bg-dark-subtle"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-accent dark:bg-dark-accent rounded-full"
          />
        </div>
      </div>

      {/* Interactive Step Content with Slide Transitions */}
      <AnimatePresence mode="wait">
        {!isEnd && step ? (
          <motion.div
            key={currentId}
            role="region"
            aria-live="polite"
            aria-label={t("wizard_question_badge")}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-accent dark:text-dark-accent">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("wizard_question_badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink dark:text-dark-ink">
              {getLocalizedQuestion(step.id, step.question)}
            </h2>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {step.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const displayLabel = getLocalizedOptionLabel(step.id, opt.label);

                return (
                  <motion.button
                    key={opt.label}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: idx * 0.04,
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{
                      x: 3,
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                    }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => choose(opt)}
                    className="group flex w-full items-center justify-between rounded-2xl border border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95 px-5 py-4 text-left text-[15px] font-medium text-ink dark:text-dark-ink shadow-card dark:shadow-card-dark backdrop-blur-sm transition-all duration-150 hover:border-accent/40 dark:hover:border-dark-accent/40 hover:bg-accent-soft/30 dark:hover:bg-dark-subtle hover:shadow-card-hover dark:hover:shadow-card-hover-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center gap-3.5 pr-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line dark:border-dark-line bg-subtle dark:bg-dark-subtle text-[12px] font-semibold text-ink-secondary dark:text-dark-ink-secondary group-hover:border-accent/30 dark:group-hover:border-dark-accent/30 group-hover:bg-accent-soft dark:group-hover:bg-dark-accent/15 group-hover:text-accent dark:group-hover:text-dark-accent transition-colors" aria-hidden="true">
                        {letter}
                      </span>
                      <span className="flex-1 text-ink dark:text-dark-ink">{displayLabel}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary dark:text-dark-ink-tertiary transition-transform duration-150 group-hover:translate-x-1 group-hover:text-ink dark:group-hover:text-dark-ink" aria-hidden="true" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            role="region"
            aria-live="polite"
            aria-label="Diagnostic result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-ok dark:text-green-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ok/10 dark:bg-green-500/15">
                <CheckCircle2 className="h-5 w-5 text-ok dark:text-green-400" aria-hidden="true" />
              </span>
              <span className="text-[13px] font-semibold uppercase tracking-wider">
                {t("wizard_matched_badge")}
              </span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-ink dark:text-dark-ink sm:text-4xl">
              {resolvedIssue ? resolvedIssue.title : t("wizard_likely_happening")}
            </h2>

            {/* Answers Traversed */}
            {answers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-[12px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary">
                  {t("wizard_path_label")}
                </span>
                {answers.map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-subtle dark:bg-dark-subtle px-3 py-1 text-[12px] text-ink-secondary dark:text-dark-ink-secondary border border-line dark:border-dark-line shadow-2xs"
                  >
                    <span>{a}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95 p-5 text-[15px] leading-relaxed text-ink dark:text-dark-ink shadow-card dark:shadow-card-dark backdrop-blur-md">
              {resolvedIssue
                ? resolvedIssue.summary
                : (language === "ms"
                    ? "Berdasarkan pilihan anda, simptom ini biasanya menunjukkan konflik perkakasan atau pemulaan perisian."
                    : "Based on your selections, this symptom typically indicates a component or software startup conflict.")}
            </div>

            {resolvedIssue && resolvedIssue.steps && (
              <div className="space-y-3 pt-2">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
                  {t("wizard_solution_steps")}
                </div>
                <div className="space-y-2.5">
                  {resolvedIssue.steps.slice(0, 3).map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-2xl border border-line dark:border-dark-line bg-white/90 dark:bg-dark-card/90 p-4 text-[14px] shadow-xs backdrop-blur-xs transition-colors hover:border-line-strong dark:hover:border-dark-line-strong"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 dark:bg-dark-accent/15 text-[12px] font-semibold text-accent dark:text-dark-accent" aria-hidden="true">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-ink dark:text-dark-ink">{s.title}</div>
                        <div className="mt-1 text-[13px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                          {s.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {resolvedIssue && (
                <Link
                  href={`/issues/${resolvedIssue.slug}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-accent hover:bg-accent-hover dark:bg-accent dark:hover:bg-accent-hover px-5 py-3 text-[14px] font-medium text-white transition-all duration-150 active:scale-95 shadow-sm shadow-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>{t("wizard_view_full_guide")}</span>
                </Link>
              )}

              <Link
                href={`/troubleshoot?q=${encodeURIComponent(
                  resolvedIssue ? resolvedIssue.title : answers.join(" ")
                )}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-pill border border-line-strong dark:border-dark-line-strong bg-white dark:bg-dark-card px-5 py-3 text-[14px] font-medium text-ink dark:text-dark-ink transition-all duration-150 hover:bg-subtle dark:hover:bg-dark-subtle active:scale-95 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <MessageSquare className="h-4 w-4 text-accent dark:text-dark-accent" aria-hidden="true" />
                <span>{t("wizard_ask_ai_explain")}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

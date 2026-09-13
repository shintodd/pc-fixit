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
    question: "Apa masalah yang jadi kat PC anda?",
    options: {
      "It won't turn on, POST, or boot into Windows": "PC langsung tak boleh on, tak keluar display, atau tak masuk Windows",
      "It crashes with a Blue Screen of Death (BSOD)": "Kerap crash keluar skrin biru (Blue Screen / BSOD)",
      "It turns on, but runs sluggish, hitches, or freezes": "PC boleh on, tapi lembap sangat, lag, atau asyik hang",
      "Internet, Wi-Fi, or Ethernet connection is failing": "Internet, Wi-Fi, atau kabel LAN ada masalah",
      "Fans are roaring, PC is overheating, or shutting down from heat": "Kipas bising gila, PC panas sangat, atau mati sendiri sebab overheat",
      "A graphics card, audio, or peripheral driver is malfunctioning": "Graphic card, sound, atau barang USB ada masalah driver",
    },
  },
  "wizard-wont-boot-power": {
    question: "Bila tekan butang power casing, apa jadi?",
    options: {
      "Completely dead (zero lights, zero fan movement)": "Mati terus (langsung tak ada lampu, kipas tak pusing)",
      "Fans spin for half a second then immediately shut off": "Kipas pusing sekejap setengah saat lepas tu terus mati",
      "Lights and fans turn on, but the display stays completely blank": "Lampu & kipas jalan elok, tapi screen tetap hitam tak keluar apa-apa",
      "Shows the motherboard or Windows logo, but then freezes or loops": "Keluar logo motherboard/Windows, lepas tu sangkut atau restart balik",
    },
  },
  "wizard-wont-boot-debug-led": {
    question: "Tengok kat motherboard, ada lampu kecik LED menyala atau bunyi beep tak?",
    options: {
      "The CPU debug LED is illuminated (red or white)": "Lampu LED tulis 'CPU' menyala (merah/putih)",
      "The DRAM debug LED is illuminated (yellow or amber)": "Lampu LED tulis 'DRAM' menyala (kuning/jingga)",
      "The VGA debug LED is lit, or monitor says 'No Signal'": "Lampu LED 'VGA' menyala, atau monitor tulis 'No Signal'",
      "The BOOT LED is lit, or the PC boots directly into the BIOS menu": "Lampu LED 'BOOT' menyala, atau PC terus masuk menu BIOS",
    },
  },
  "wizard-wont-boot-freeze": {
    question: "Kat mana PC tu mula sangkut atau beku?",
    options: {
      "Frozen on the motherboard logo with stuck spinning dots": "Sangkut kat logo motherboard dengan titik pusingan beku",
      "Stuck in a 'Preparing Automatic Repair' diagnostic loop": "Asyik keluar 'Preparing Automatic Repair' tak habis-habis",
    },
  },
  "wizard-bsod-timing": {
    question: "Bila masa biasa keluar skrin biru (BSOD) tu?",
    options: {
      "During Windows startup before the login screen appears": "Masa mula-mula on Windows sebelum sempat login",
      "Randomly during desktop usage or web browsing": "Bila-bila masa je secara rawak masa tengah guna biasa",
      "Specifically while launching or playing heavy 3D games": "Masa baru buka atau tengah main game 3D",
      "Right after installing a new Windows update or device driver": "Lepas baru je buat update Windows atau update driver",
    },
  },
  "wizard-slow-pattern": {
    question: "Macam mana gaya PC tu jadi lembap?",
    options: {
      "Disk usage is locked at 100% in Task Manager": "Disk usage sangkut 100% kat Task Manager",
      "CPU frequency is severely throttled (e.g. locked at 0.79 GHz)": "Speed CPU jatuh teruk (cth. sangkut 0.79 GHz je)",
      "High CPU usage by Windows Update or background services": "Windows Update atau program background tarik CPU tinggi",
      "Complete system freeze requiring a hard power reset": "PC jem keras terus, kena tekan lama button power untuk off",
    },
  },
  "wizard-network-type": {
    question: "Apa masalah internet yang jadi?",
    options: {
      "Wi-Fi shows connected but says 'No Internet' (APIPA 169.254)": "Wi-Fi tulis connected tapi tak ada internet (IP 169.254)",
      "Browser reports 'DNS server not responding' or site not found": "Browser tulis 'DNS server not responding' tak boleh buka web",
      "Default gateway is not available with yellow warning icon": "Keluar tanda seru kuning 'Default gateway not available'",
      "Ethernet connection constantly drops and reconnects": "Line kabel LAN asyik putus-putus dan connect balik",
    },
  },
  "wizard-thermal-symptom": {
    question: "Macam mana tanda PC panas tu?",
    options: {
      "PC abruptly shuts off without warning during heavy gaming": "PC terus terpadam sendiri mengejut masa main game",
      "CPU temperature immediately spikes to 95C - 100C even on idle": "Suhu CPU terus melompat 95C - 100C walaupun tak buka apa-apa",
      "GPU memory or hotspot temperature throttling performance": "Suhu graphic card panas sangat sampai game sangkut-sangkut",
      "Case fans are running at 100% jet-engine speed constantly": "Kipas casing bunyi bising gila pusing 100% tanpa henti",
    },
  },
  "wizard-driver-device": {
    question: "Komponen atau peranti mana yang buat hal?",
    options: {
      "Display flickers black or GPU driver crashes (Code 43 / TDR)": "Screen kelip hitam atau driver GPU crash (Code 43 / TDR)",
      "Front panel 3.5mm headphone jack produces no audio": "Lubang headphone depan casing langsung tak ada bunyi",
      "USB device draws too much power or port surge detected": "Keluar error USB terlebih power (power surge)",
      "Bluetooth or Wi-Fi adapter shows Code 10 in Device Manager": "Bluetooth atau Wi-Fi keluar Code 10 kat Device Manager",
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
                className="relative inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-2 py-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("wizard_back_btn")}</span>
              </button>
            )}
            {path.length > 1 && (
              <button
                type="button"
                onClick={reset}
                className="relative inline-flex min-h-[44px] items-center gap-1 text-[13px] font-medium text-accent dark:text-dark-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-2 py-1.5"
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
                    data-option="wizard-choice"
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

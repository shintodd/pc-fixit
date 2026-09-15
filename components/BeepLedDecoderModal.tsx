"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Lightbulb, Play, Square, Check, AlertCircle, Wrench, Camera } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BeepPattern {
  id: string;
  nameEn: string;
  nameMs: string;
  timing: number[]; // durations in seconds
  meaningEn: string;
  meaningMs: string;
  fixEn: string;
  fixMs: string;
}

const BEEP_PATTERNS: BeepPattern[] = [
  {
    id: "ami-ram",
    nameEn: "3 Short Beeps",
    nameMs: "3 Kali Beep Pendek",
    timing: [0.12, 0.12, 0.12],
    meaningEn: "RAM / Memory Failure (First 64KB memory test failed).",
    meaningMs: "Kerosakan atau kegagalan membaca modul RAM (Memori).",
    fixEn: "Turn off PC, unplug wall cord, remove RAM sticks, clean gold pins with microfiber cloth, and firmly click into slots 2 and 4.",
    fixMs: "Tutup PC, cabut plug dinding, cabut RAM dan pasang semula dengan kemas ke slot nombor 2 dan 4.",
  },
  {
    id: "ami-gpu",
    nameEn: "1 Long + 2 Short Beeps",
    nameMs: "1 Beep Panjang + 2 Beep Pendek",
    timing: [0.4, 0.12, 0.12],
    meaningEn: "Graphics Card (GPU) or Display Error.",
    meaningMs: "Isu Kad Grafik (GPU) atau sambungan monitor tidak dikesan.",
    fixEn: "Verify monitor cable is in bottom GPU port. Reseat graphics card firmly into PCIe slot and check PCIe 8-pin power cables.",
    fixMs: "Pastikan kabel monitor dicucuk pada port GPU bawah. Cabut dan pasang semula kad grafik ke slot PCIe.",
  },
  {
    id: "ami-gate20",
    nameEn: "1 Long + 3 Short Beeps",
    nameMs: "1 Beep Panjang + 3 Beep Pendek",
    timing: [0.4, 0.12, 0.12, 0.12],
    meaningEn: "Conventional Memory / VRAM failure or Keyboard Controller error.",
    meaningMs: "Kegagalan membaca memori grafik VRAM atau pengawal papan kekunci.",
    fixEn: "Clear motherboard CMOS by removing the coin battery for 5 minutes, then reseat graphics card.",
    fixMs: "Reset CMOS dengan mencabut bateri leper bulat selama 5 minit sebelum hidupkan semula.",
  },
  {
    id: "ami-continuous",
    nameEn: "Continuous Repeating Beeps",
    nameMs: "Beep Berterusan Tanpa Henti",
    timing: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
    meaningEn: "Power Supply Fault or RAM completely missing/unseated.",
    meaningMs: "Isu bekalan kuasa (PSU) atau RAM langsung tidak dikesan.",
    fixEn: "Check main 24-pin motherboard power cable and re-insert RAM until both side clips snap fully shut.",
    fixMs: "Periksa wayar kuasa 24-pin motherboard dan pastikan klip RAM terkunci rapat di kedua-dua belah.",
  },
  {
    id: "ami-normal",
    nameEn: "1 Single Short Beep (On startup)",
    nameMs: "1 Beep Pendek Tunggal (Masa on)",
    timing: [0.1],
    meaningEn: "Normal Boot: System passed all self-tests successfully.",
    meaningMs: "Boot Normal: Semua ujian perkakasan lulus dengan jayanya.",
    fixEn: "Your hardware is healthy. If you have no display, check monitor power and input source (HDMI 1 / DP 1).",
    fixMs: "Hardware dalam keadaan baik. Jika tiada gambar, periksa suis monitor dan pilih input HDMI 1 / DP 1.",
  },
];

const DEBUG_LEDS = [
  {
    id: "CPU",
    color: "bg-red-500 text-white",
    nameEn: "CPU LED (Red)",
    nameMs: "Lampu CPU (Merah)",
    descEn: "Motherboard cannot initialize the processor.",
    descMs: "Motherboard gagal mengesan atau menghidupkan pemproses CPU.",
    stepsEn: [
      "Check the 8-pin CPU power cable plugged into the top-left corner of the motherboard.",
      "Inspect CPU socket for bent pins if recently assembled.",
      "Verify your motherboard BIOS version supports this specific processor model.",
    ],
    stepsMs: [
      "Periksa kabel kuasa 8-pin CPU di sudut atas kiri motherboard sama ada dipasang ketat.",
      "Periksa sama ada terdapat pin bengkok jika baru pasang processor.",
      "Semak sama ada versi BIOS motherboard menyokong model processor tersebut.",
    ],
  },
  {
    id: "DRAM",
    color: "bg-amber-500 text-white",
    nameEn: "DRAM LED (Yellow / Amber / Orange)",
    nameMs: "Lampu DRAM (Kuning / Jingga)",
    descEn: "Motherboard cannot read working memory sticks.",
    descMs: "Motherboard gagal membaca kepingan memori RAM.",
    stepsEn: [
      "Remove both RAM sticks and re-insert into slots 2 and 4 (counting right from CPU).",
      "Push down firmly until both plastic clips audibly click shut.",
      "Test with only 1 RAM stick in slot 2 to identify a dead stick.",
    ],
    stepsMs: [
      "Cabut kedua-dua keping RAM dan pasang semula ke slot 2 dan 4 (kira dari CPU ke kanan).",
      "Tekan kuat ke bawah sehingga klip tepi berbunyi klik rapat.",
      "Cuba guna 1 keping RAM sahaja dalam slot 2 untuk kenal pasti jika ada kepingan rosak.",
    ],
  },
  {
    id: "VGA",
    color: "bg-white text-slate-900 border border-line",
    nameEn: "VGA LED (White / Red)",
    nameMs: "Lampu VGA (Putih / Merah)",
    descEn: "Graphics card missing, unpowered, or display cable not detected.",
    descMs: "Kad grafik tidak dikesan, wayar kuasa longgar, atau monitor tidak detect kabel.",
    stepsEn: [
      "Turn on your monitor FIRST before turning on the computer case.",
      "Ensure monitor cable is plugged into the lower GPU horizontal ports.",
      "Check that all PCIe 8-pin power connectors on the graphics card are plugged in firmly.",
    ],
    stepsMs: [
      "Hidupkan suis monitor DAHULU sebelum tekan butang power PC.",
      "Pastikan kabel monitor dicucuk pada port mendatar GPU di slot bawah.",
      "Pastikan semua kabel PCIe 8-pin pada kad grafik dipasang rapat.",
    ],
  },
  {
    id: "BOOT",
    color: "bg-emerald-500 text-white",
    nameEn: "BOOT LED (Green / Yellow)",
    nameMs: "Lampu BOOT (Hijau / Kuning)",
    descEn: "Hardware is working, but no bootable Windows drive is found.",
    descMs: "Perkakasan berfungsi baik, cuma sistem operasi Windows tidak dijumpai.",
    stepsEn: [
      "Check SATA cable or M.2 NVMe SSD is firmly seated.",
      "Enter BIOS (press Delete / F2 on startup) and verify your Windows drive is listed in Boot Order.",
      "If Windows was recently installed, ensure UEFI mode is enabled rather than Legacy CSM.",
    ],
    stepsMs: [
      "Periksa kabel SSD SATA atau slot M.2 NVMe dipasang kemas.",
      "Masuk ke BIOS (tekan Delete / F2 waktu mula on) dan pastikan SSD ada dalam senarai Boot.",
      "Pastikan mod BIOS disetkan kepada UEFI bukan Legacy CSM.",
    ],
  },
];

const LED_HARDWARE_IMAGES: Record<string, { src: string; alt: string; labelEn: string; labelMs: string }> = {
  CPU: {
    src: "/images/hardware/motherboard-cpu.jpg",
    alt: "Processor socket and retention lever",
    labelEn: "CPU Socket & Retention Lever",
    labelMs: "Soket CPU & Tuil Pengunci",
  },
  DRAM: {
    src: "/images/hardware/ram-dimm-slots.jpg",
    alt: "Motherboard RAM DIMM slots and clips",
    labelEn: "RAM DIMM Slots & Latches",
    labelMs: "Slot RAM & Klip Pengunci",
  },
  VGA: {
    src: "/images/hardware/gpu-bracket-ports.jpg",
    alt: "Graphics card rear PCIe bracket ports",
    labelEn: "GPU Rear Expansion Bracket",
    labelMs: "Plat Belakang Kad Grafik",
  },
  BOOT: {
    src: "/images/hardware/hard-drive-storage.jpg",
    alt: "Storage drive connectors and SATA ports",
    labelEn: "Storage Drive & SATA Cables",
    labelMs: "Pemacu Simpanan & Wayar SATA",
  },
};

export default function BeepLedDecoderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"led" | "beeps">("led");
  const [selectedLed, setSelectedLed] = useState(DEBUG_LEDS[1]); // DRAM by default
  const [playingBeepId, setPlayingBeepId] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isMs = language === "ms";

  // Synthesize beep sequence via Web Audio API
  function playBeeps(pattern: BeepPattern) {
    stopBeeps();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setPlayingBeepId(pattern.id);

      let currentTime = ctx.currentTime + 0.05;
      const freq = 880; // Standard motherboard buzzer A5 pitch

      pattern.timing.forEach((dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, currentTime);

        gain.gain.setValueAtTime(0.18, currentTime);
        gain.gain.setValueAtTime(0, currentTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + dur);

        currentTime += dur + 0.14; // pause between beeps
      });

      const totalDuration = (currentTime - ctx.currentTime) * 1000;
      setTimeout(() => {
        setPlayingBeepId(null);
      }, totalDuration);
    } catch (e) {
      console.warn("Web Audio API beep synthesis failed:", e);
      setPlayingBeepId(null);
    }
  }

  function stopBeeps() {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    setPlayingBeepId(null);
  }

  useEffect(() => {
    return () => stopBeeps();
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        stopBeeps();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="beep-decoder-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              stopBeeps();
              onClose();
            }}
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
          aria-labelledby="beep-modal-title"
          className="glass-element glass-adaptive relative w-full max-w-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:text-dark-accent">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h2 id="beep-modal-title" className="text-lg font-bold text-ink dark:text-dark-ink">
                  {isMs ? "Pengesan Bunyi Beep & Lampu LED" : "Motherboard Beep & LED Decoder"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Ketahui komponen yang rosak tanpa monitor menggunakan kod lampu atau bunyi."
                    : "Diagnose black-screen hardware failures using motherboard lights or buzzer beeps."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopBeeps();
                onClose();
              }}
              className="rounded-full p-1.5 text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-subtle dark:bg-dark-subtle p-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopBeeps();
                setActiveTab("led");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "led"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              <span>{isMs ? "Lampu Debug LED" : "4-Light Debug LEDs"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("beeps")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "beeps"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Volume2 className="h-4 w-4" />
              <span>{isMs ? "Bunyi Beep Buzzer" : "Motherboard Beeps"}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-[13px]">
            {activeTab === "led" ? (
              <div className="space-y-4">
                {/* 4 LED Selector Bar */}
                <div className="space-y-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
                    {isMs ? "Pilih lampu motherboard yang menyala:" : "Select which LED is lit on your motherboard:"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEBUG_LEDS.map((led) => (
                      <button
                        key={led.id}
                        type="button"
                        onClick={() => setSelectedLed(led)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          selectedLed.id === led.id
                            ? "border-accent ring-2 ring-accent/20 bg-accent-soft/30 dark:bg-dark-accent/15"
                            : "border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 hover:bg-subtle"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full ${led.color} shadow-xs mb-1.5`} />
                        <span className="font-bold text-ink dark:text-dark-ink">{led.id}</span>
                        <span className="text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
                          {led.id === "DRAM" ? (isMs ? "RAM" : "RAM") : led.id === "VGA" ? (isMs ? "GPU" : "GPU") : led.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* LED Diagnostic Details Card */}
                <div className="rounded-2xl border border-line dark:border-dark-line bg-white/80 dark:bg-dark-card/80 p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${selectedLed.color}`} />
                      <h3 className="font-bold text-[15px] text-ink dark:text-dark-ink">
                        {isMs ? selectedLed.nameMs : selectedLed.nameEn}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-subtle dark:bg-dark-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-tertiary dark:text-dark-ink-tertiary">
                      <Camera className="h-3 w-3 text-accent" />
                      <span>{isMs ? "Foto Sebenar" : "Real Photo"}</span>
                    </span>
                  </div>
                  <p className="text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                    {isMs ? selectedLed.descMs : selectedLed.descEn}
                  </p>

                  {/* Real Hardware Reference Photo */}
                  {LED_HARDWARE_IMAGES[selectedLed.id] && (
                    <div className="flex items-center gap-3 rounded-xl border border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 p-2.5">
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-line/80 dark:border-dark-line/80 bg-black/10">
                        <Image
                          src={LED_HARDWARE_IMAGES[selectedLed.id].src}
                          alt={LED_HARDWARE_IMAGES[selectedLed.id].alt}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-[12px] font-bold text-ink dark:text-dark-ink truncate">
                          {isMs
                            ? LED_HARDWARE_IMAGES[selectedLed.id].labelMs
                            : LED_HARDWARE_IMAGES[selectedLed.id].labelEn}
                        </div>
                        <p className="text-[11px] text-ink-secondary dark:text-dark-ink-secondary leading-tight">
                          {isMs
                            ? "Foto rujukan fizikal untuk kenal pasti komponen motherboard."
                            : "Physical hardware reference to identify motherboard component."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-line/60 dark:border-dark-line/60 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-accent dark:text-dark-accent flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" />
                      <span>{isMs ? "Langkah Baiki Terus:" : "Direct Resolution Steps:"}</span>
                    </div>
                    <div className="space-y-2">
                      {(isMs ? selectedLed.stepsMs : selectedLed.stepsEn).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-ink dark:text-dark-ink leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary block mb-1">
                  {isMs ? "Tekan butang play untuk dengar contoh bunyi:" : "Click play to listen and match your PC beep sound:"}
                </span>

                {BEEP_PATTERNS.map((p) => {
                  const isPlaying = playingBeepId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-line dark:border-dark-line bg-white dark:bg-dark-card p-4 space-y-2.5 shadow-xs transition-colors hover:border-accent/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[14px] text-ink dark:text-dark-ink">
                          <Volume2 className="h-4 w-4 text-accent" />
                          <span>{isMs ? p.nameMs : p.nameEn}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => (isPlaying ? stopBeeps() : playBeeps(p))}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                            isPlaying
                              ? "bg-critical text-white shadow-sm"
                              : "bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/20 active:scale-95"
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="h-3 w-3 fill-current" />
                              <span>{isMs ? "Berhenti" : "Stop"}</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 fill-current" />
                              <span>{isMs ? "Dengar Bunyi" : "Play Sound"}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary">
                        <strong className="text-ink dark:text-dark-ink">
                          {isMs ? "Punca: " : "Culprit: "}
                        </strong>
                        {isMs ? p.meaningMs : p.meaningEn}
                      </div>

                      <div className="rounded-xl bg-subtle/50 dark:bg-dark-subtle/50 p-2.5 text-[12px] text-ink-secondary dark:text-dark-ink-secondary">
                        <strong className="text-accent dark:text-dark-accent">
                          {isMs ? "Langkah: " : "Fix: "}
                        </strong>
                        {isMs ? p.fixMs : p.fixEn}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-line dark:border-dark-line flex justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                stopBeeps();
                onClose();
              }}
              className="rounded-pill bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all"
            >
              {isMs ? "Tutup Decoder" : "Close Decoder"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}

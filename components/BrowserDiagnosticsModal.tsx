"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Activity,
  Tv,
  Keyboard,
  Volume2,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BrowserDiagnosticsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"screen" | "refreshrate" | "keyboard" | "audio">("screen");

  // Screen dead pixel state
  const [colorIndex, setColorIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  // Refresh rate telemetry state
  const [measuredHz, setMeasuredHz] = useState<number | null>(null);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [isMeasuringHz, setIsMeasuringHz] = useState(false);
  const ufoPosRef = useRef(0);
  const [ufoPos, setUfoPos] = useState(0);

  // Keyboard chatter state
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [chatterLog, setChatterLog] = useState<{ key: string; ms: number }[]>([]);
  const lastKeyTimes = useRef<Record<string, number>>({});

  // Audio test state
  const [playingAudio, setPlayingAudio] = useState<"left" | "right" | "both" | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isMs = language === "ms";

  const SCREEN_COLORS = [
    { nameEn: "Pure Black (Bleed / Stuck Pixel)", nameMs: "Hitam Pekat (Lampu Bocor)", hex: "#000000" },
    { nameEn: "Pure White (Dead Black Pixel)", nameMs: "Putih Bersih (Pixel Mati)", hex: "#ffffff" },
    { nameEn: "Pure Red Subpixel", nameMs: "Sub-Pixel Merah", hex: "#ff0000" },
    { nameEn: "Pure Green Subpixel", nameMs: "Sub-Pixel Hijau", hex: "#00ff00" },
    { nameEn: "Pure Blue Subpixel", nameMs: "Sub-Pixel Biru", hex: "#0000ff" },
    { nameEn: "50% Gray (Uniformity)", nameMs: "Kelabu 50% (Keseragaman)", hex: "#808080" },
  ];

  // Refresh rate measurement loop
  useEffect(() => {
    if (!isOpen || activeTab !== "refreshrate") {
      setIsMeasuringHz(false);
      return;
    }

    setIsMeasuringHz(true);
    let frameCount = 0;
    let startTime = performance.now();
    let lastFrameTime = performance.now();
    let dropped = 0;
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      const delta = now - lastFrameTime;
      lastFrameTime = now;

      // Animate UFO bar
      ufoPosRef.current = (ufoPosRef.current + 8) % 360;
      setUfoPos(ufoPosRef.current);

      if (delta > 32) {
        dropped++;
      }

      if (now - startTime >= 1000) {
        const elapsedSec = (now - startTime) / 1000;
        const currentHz = Math.round(frameCount / elapsedSec);
        setMeasuredHz(currentHz);
        setDroppedFrames(dropped);
        frameCount = 0;
        dropped = 0;
        startTime = now;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab]);

  // Keyboard chatter detection
  useEffect(() => {
    if (!isOpen || activeTab !== "keyboard") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyName = e.code || e.key;
      const now = performance.now();
      const lastTime = lastKeyTimes.current[keyName] || 0;
      const diff = now - lastTime;

      // If key is triggered twice in less than 20ms, it is physical mechanical chatter
      if (diff > 2 && diff < 20) {
        setChatterLog((prev) => [{ key: keyName, ms: Math.round(diff) }, ...prev.slice(0, 9)]);
      }

      lastKeyTimes.current[keyName] = now;
      setPressedKeys((prev) => Array.from(new Set([...prev, keyName])));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyName = e.code || e.key;
      setPressedKeys((prev) => prev.filter((k) => k !== keyName));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen, activeTab]);

  // Audio Channel Synthesizer
  function playAudioChannel(channel: "left" | "right" | "both") {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setPlayingAudio(channel);

      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);

      if (channel === "left") {
        panner.pan.setValueAtTime(-1, ctx.currentTime);
      } else if (channel === "right") {
        panner.pan.setValueAtTime(1, ctx.currentTime);
      } else {
        panner.pan.setValueAtTime(0, ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(panner);
      panner.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      setTimeout(() => {
        setPlayingAudio(null);
      }, 1250);
    } catch {
      setPlayingAudio(null);
    }
  }

  // Fullscreen screen dead pixel tester
  function toggleFullscreen() {
    if (!screenRef.current) return;
    if (!document.fullscreenElement) {
      screenRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="browser-diag-title"
          className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-dark-card border border-line dark:border-dark-line shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-line dark:border-dark-line shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 id="browser-diag-title" className="font-bold text-[16px] text-ink dark:text-dark-ink">
                  {isMs ? "Makmal Diagnostik Browser" : "Browser Hardware Diagnostic Lab"}
                </h2>
                <p className="text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
                  {isMs
                    ? "Ujian skrin, kelajuan Hz paparan, kerosakan keyboard dan saluran audio tanpa pasang software."
                    : "Zero-install client tests: dead pixel, refresh rate, keyboard chatter, and stereo audio."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink-tertiary hover:text-ink hover:bg-subtle dark:hover:bg-dark-subtle dark:hover:text-dark-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Switcher (Horizontal scroll on mobile, 4-grid on sm) */}
          <div className="flex items-center overflow-x-auto no-scrollbar touch-scroll sm:grid sm:grid-cols-4 rounded-xl bg-subtle dark:bg-dark-subtle p-1 mx-5 mt-4 shrink-0 gap-1 text-[12px]">
            <button
              type="button"
              onClick={() => setActiveTab("screen")}
              className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 py-2 px-3 whitespace-nowrap rounded-lg font-semibold transition-all ${
                activeTab === "screen"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              <span>{isMs ? "Pixel Skrin" : "Dead Pixel"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("refreshrate")}
              className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 py-2 px-3 whitespace-nowrap rounded-lg font-semibold transition-all ${
                activeTab === "refreshrate"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{isMs ? "Meter Hz" : "Refresh Hz"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("keyboard")}
              className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 py-2 px-3 whitespace-nowrap rounded-lg font-semibold transition-all ${
                activeTab === "keyboard"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>{isMs ? "Chatter Keyboard" : "Key Chatter"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audio")}
              className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 py-2 px-3 whitespace-nowrap rounded-lg font-semibold transition-all ${
                activeTab === "audio"
                  ? "bg-white dark:bg-dark-card text-accent dark:text-dark-accent shadow-xs"
                  : "text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{isMs ? "Audio L / R" : "Audio Phase"}</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-[13px]">
            {/* Tab 1: Dead Pixel / Screen Test */}
            {activeTab === "screen" && (
              <div className="space-y-3">
                <div
                  ref={screenRef}
                  onClick={() => setColorIndex((prev) => (prev + 1) % SCREEN_COLORS.length)}
                  style={{ backgroundColor: SCREEN_COLORS[colorIndex].hex }}
                  className="w-full h-44 rounded-2xl border border-line dark:border-dark-line flex flex-col items-center justify-center cursor-pointer select-none transition-colors relative overflow-hidden group shadow-inner"
                >
                  <span
                    className={`text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-md ${
                      colorIndex === 1 ? "bg-black/80 text-white" : "bg-white/80 text-black"
                    }`}
                  >
                    {isMs ? SCREEN_COLORS[colorIndex].nameMs : SCREEN_COLORS[colorIndex].nameEn}
                  </span>
                  <span
                    className={`text-[10px] mt-1 opacity-80 ${
                      colorIndex === 1 ? "text-slate-800" : "text-white"
                    }`}
                  >
                    {isMs ? "Klik untuk tukar warna" : "Click to cycle color pattern"}
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    {SCREEN_COLORS.map((col, idx) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setColorIndex(idx)}
                        aria-label={`Select color: ${col.nameEn}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        title={col.nameEn}
                      >
                        <span
                          style={{ backgroundColor: col.hex }}
                          className={`w-6 h-6 rounded-full border border-slate-400 transition-transform block ${
                            colorIndex === idx ? "scale-125 ring-2 ring-accent" : "opacity-80"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-subtle dark:bg-dark-subtle hover:bg-line dark:hover:bg-dark-line text-ink dark:text-dark-ink font-semibold text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>{isMs ? "Skrin Penuh (Fullscreen)" : "Fullscreen Test"}</span>
                  </button>
                </div>

                <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
                  {isMs
                    ? "Gunakan warna hitam pekat dalam bilik gelap untuk mengesan kebocoran lampu latar (backlight bleed). Pada skrin putih bersih, cari bintik hitam mati yang tidak mengeluarkan cahaya."
                    : "Inspect in a dark room using Pure Black to locate IPS backlight bleed. Switch to Pure White to spot permanent dead dark pixels."}
                </p>
              </div>
            )}

            {/* Tab 2: Refresh Rate Meter */}
            {activeTab === "refreshrate" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 text-center space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                    {isMs ? "Kadar Segar Semula Dikesan" : "Real-Time Display Refresh Rate"}
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    {measuredHz ? `${measuredHz} Hz` : "Measuring..."}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-3 font-mono">
                    <span>
                      {isMs ? "Bingkai Tercicir:" : "Dropped frames:"} {droppedFrames}
                    </span>
                    <span>|</span>
                    <span className="text-emerald-300">
                      {measuredHz && measuredHz >= 120
                        ? isMs
                          ? "Kadar Tinggi Aktif (Smooth)"
                          : "High Refresh Active"
                        : measuredHz && measuredHz <= 60
                        ? isMs
                          ? "Kadar Standard (60Hz)"
                          : "Standard 60Hz"
                        : "Active"}
                    </span>
                  </div>
                </div>

                {/* UFO Smooth Motion Bar */}
                <div className="p-3 rounded-2xl border border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 space-y-1.5">
                  <div className="text-[11px] font-bold text-ink dark:text-dark-ink flex items-center justify-between">
                    <span>{isMs ? "Ujian Kelancaran Pergerakan (Motion Pacer)" : "Motion Pacing UFO Bar"}</span>
                    <span className="text-ink-tertiary dark:text-dark-ink-tertiary font-mono text-[10px]">
                      {measuredHz} FPS target
                    </span>
                  </div>
                  <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                    <div
                      style={{ transform: `translateX(${ufoPos}px)` }}
                      className="w-12 h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-md shadow-md"
                    />
                  </div>
                  <span className="text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary block">
                    {isMs
                      ? "Jika kotak di atas bergerak secara tersentak-sentak, Windows anda mungkin tersangkut pada 60Hz dalam tetapan paparan."
                      : "If the moving bar stutters, check Windows Display Settings: Advanced display to ensure your high-refresh rate is enabled."}
                  </span>
                </div>
              </div>
            )}

            {/* Tab 3: Keyboard Switch Chatter */}
            {activeTab === "keyboard" && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-line dark:border-dark-line bg-subtle/40 dark:bg-dark-subtle/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-ink dark:text-dark-ink">
                      {isMs ? "Tekan kekunci pada keyboard anda:" : "Press any keys on your keyboard:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPressedKeys([]);
                        setChatterLog([]);
                      }}
                      className="inline-flex min-h-[44px] items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold text-accent hover:underline rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>{isMs ? "Padam Log" : "Clear Log"}</span>
                    </button>
                  </div>

                  <div className="min-h-12 p-2 rounded-xl bg-white dark:bg-dark-card border border-line dark:border-dark-line flex flex-wrap gap-1.5 items-center">
                    {pressedKeys.length === 0 ? (
                      <span className="text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary italic">
                        {isMs ? "Tekan kekunci mekanikal berulang kali untuk menguji chatter..." : "Press keys rapidly to detect switch bounce..."}
                      </span>
                    ) : (
                      pressedKeys.map((k) => (
                        <span
                          key={k}
                          className="px-2 py-1 rounded-md bg-accent text-white font-mono text-[11px] font-bold shadow-xs"
                        >
                          {k}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Chatter Incident Alert List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
                    {isMs ? "Status Kesihatan Suis (Chatter Report):" : "Switch Bounce / Chatter Report:"}
                  </span>
                  {chatterLog.length === 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-[12px]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {isMs
                          ? "Tiada suis chatter dikesan. Suis mekanikal anda berfungsi dengan stabil."
                          : "No switch chatter detected. Mechanical leaf contacts are healthy."}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {chatterLog.map((log, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2 font-mono font-bold">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                            <span>{log.key}</span>
                          </div>
                          <span>
                            {isMs
                              ? `Dua kali tekan dikesan dalam ${log.ms}ms (Rosak/Kotor)`
                              : `Double-press registered in ${log.ms}ms (Chatter Defect)`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Audio Channel Phase */}
            {activeTab === "audio" && (
              <div className="space-y-3">
                <p className="text-[12px] text-ink-secondary dark:text-dark-ink-secondary">
                  {isMs
                    ? "Uji sama ada saluran fon telinga kiri dan kanan anda terbalik atau tidak seimbang akibat soket 3.5mm longgar."
                    : "Verify headphone Left and Right wiring channels to identify loose 3.5mm jacks or Windows mono audio misconfigurations."}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => playAudioChannel("left")}
                    className={`p-4 min-h-[80px] rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      playingAudio === "left"
                        ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 scale-105"
                        : "border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 text-ink dark:text-dark-ink hover:border-accent"
                    }`}
                  >
                    <Volume2 className="h-5 w-5 text-blue-500" />
                    <span className="font-bold text-[13px]">{isMs ? "Saluran Kiri" : "Left Ear"}</span>
                    <span className="text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary">440Hz Sine Tone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playAudioChannel("both")}
                    className={`p-4 min-h-[80px] rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      playingAudio === "both"
                        ? "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400 scale-105"
                        : "border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 text-ink dark:text-dark-ink hover:border-accent"
                    }`}
                  >
                    <Volume2 className="h-5 w-5 text-purple-500" />
                    <span className="font-bold text-[13px]">{isMs ? "Tengah (Stereo)" : "Center"}</span>
                    <span className="text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary">Balanced</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playAudioChannel("right")}
                    className={`p-4 min-h-[80px] rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      playingAudio === "right"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105"
                        : "border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 text-ink dark:text-dark-ink hover:border-accent"
                    }`}
                  >
                    <Volume2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-[13px]">{isMs ? "Saluran Kanan" : "Right Ear"}</span>
                    <span className="text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary">440Hz Sine Tone</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

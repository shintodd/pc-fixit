"use client";

import { useState, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Power,
  AlertTriangle,
  Gauge,
  Wifi,
  Flame,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DemoVideoShowcase() {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
  };

  const DOCK_ICONS = [
    { icon: Power, label: language === "ms" ? "Kuasa & Boot" : "Power & Boot" },
    { icon: AlertTriangle, label: language === "ms" ? "Blue Screen (BSOD)" : "Blue Screen (BSOD)" },
    { icon: Gauge, label: language === "ms" ? "Kelajuan & Latensi" : "Speed & Latency" },
    { icon: Wifi, label: language === "ms" ? "Rangkaian & Wi-Fi" : "Network & Wi-Fi" },
    { icon: Flame, label: language === "ms" ? "Suhu & Kipas" : "Thermals & Fans" },
    { icon: Cpu, label: language === "ms" ? "GPU & Pemproses" : "GPU & Silicon" },
    { icon: Sparkles, label: language === "ms" ? "Teknisi AI" : "AI Technician" },
  ];

  return (
    <section className="relative mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 pt-6 pb-16 sm:pb-24">
      {/* Antigravity Ambient Background Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-5xl h-96 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 dark:from-blue-600/15 dark:via-sky-500/10 dark:to-indigo-600/15 blur-3xl rounded-full -z-10"
        aria-hidden="true"
      />

      {/* Antigravity Style Video Frame */}
      <div className="relative mx-auto max-w-5xl rounded-[28px] sm:rounded-[36px] bg-black border border-line/80 dark:border-white/15 shadow-2xl overflow-hidden group">
        <video
          ref={videoRef}
          src="/videos/pcfix-demo.mp4"
          poster="/videos/pcfix-demo-poster.jpg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover block aspect-video pointer-events-none select-none rounded-[28px] sm:rounded-[36px]"
          aria-label="pcfix demonstration video"
        />

        {/* Antigravity Floating Circular Glass Control Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 h-11 w-11 sm:h-12 sm:w-12 rounded-full backdrop-blur-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 border border-white/20 text-white shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title={isMuted ? (language === "ms" ? "Buka bunyi" : "Unmute audio") : (language === "ms" ? "Senyapkan bunyi" : "Mute audio")}
          aria-label={isMuted ? (language === "ms" ? "Buka bunyi" : "Unmute audio") : (language === "ms" ? "Senyapkan bunyi" : "Mute audio")}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white/90" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Antigravity Floating Icon Dock */}
      <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
        {DOCK_ICONS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="group relative flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-line/80 dark:border-dark-line/80 bg-white/90 dark:bg-dark-card/90 shadow-2xs backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-accent/40 dark:hover:border-dark-accent/40"
            title={label}
            aria-label={label}
          >
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-ink-secondary dark:text-dark-ink-secondary group-hover:text-accent dark:group-hover:text-dark-accent transition-colors" />
          </div>
        ))}
      </div>

      {/* Antigravity Statement Headline with Blinking Cursor */}
      <div className="mt-8 sm:mt-12 text-center max-w-3xl mx-auto px-4">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink dark:text-dark-ink leading-snug sm:leading-tight">
          {language === "ms"
            ? "pcfix ialah platform diagnosis perkakasan, membolehkan sesiapa sahaja mengenal pasti dan membaiki kerosakan PC dalam beberapa saat."
            : "pcfix is your hardware diagnostic platform, allowing anyone to troubleshoot complex PC failures in seconds."}
          <span className="inline-block w-0.5 h-6 sm:h-8 ml-1.5 bg-accent align-middle animate-pulse" aria-hidden="true" />
        </h3>
      </div>
    </section>
  );
}

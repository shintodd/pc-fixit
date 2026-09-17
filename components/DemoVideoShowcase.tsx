"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DemoVideoShowcase() {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    video.play().catch(() => {
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && video.paused) {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl 2xl:max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 sm:py-16 border-t border-line/60 dark:border-dark-line/60">
      {/* Subtle Ambient Back-Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-80 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3.5 py-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400 shadow-xs mb-3">
          <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{t("demo_badge")}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink dark:text-dark-ink">
          {t("demo_title")}
        </h2>
        <p className="mt-2.5 text-[14px] sm:text-[15px] text-ink-secondary dark:text-dark-ink-secondary max-w-2xl mx-auto leading-relaxed">
          {t("demo_subtitle")}
        </p>
      </div>

      {/* Video Container Frame */}
      <div className="mx-auto max-w-5xl rounded-2xl sm:rounded-3xl border border-line/80 dark:border-dark-line/80 bg-white/90 dark:bg-dark-card/90 shadow-2xl dark:shadow-card-dark overflow-hidden backdrop-blur-md">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-line/60 dark:border-dark-line/60 bg-subtle/50 dark:bg-dark-subtle/50 text-[12px]">
          {/* Mac-style Window Dots */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary hidden sm:inline-block">
              pcfix-hardware-diagnostics-v1.0.mp4
            </span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-accent/10 text-accent dark:text-dark-accent px-2 py-0.5 font-mono text-[11px] font-semibold">
              1080p HD
            </span>
            <span className="inline-flex items-center rounded-md border border-line dark:border-dark-line bg-white/60 dark:bg-dark-card/60 px-2 py-0.5 font-mono text-[11px] text-ink-secondary dark:text-dark-ink-secondary">
              {language === "ms" ? "Gelung Berulang" : "Looping"}
            </span>
          </div>
        </div>

        {/* Video Player Surface */}
        <div className="relative aspect-video w-full bg-black/95 overflow-hidden group">
          <video
            ref={videoRef}
            src="/videos/pcfix-demo.mp4"
            poster="/videos/pcfix-demo-poster.jpg"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover cursor-pointer"
            onClick={togglePlay}
          />

          {/* Floating Hover Controls Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            {/* Top Bar inside Video */}
            <div className="flex justify-end pointer-events-auto">
              <button
                type="button"
                onClick={handleFullscreen}
                className="rounded-lg bg-black/50 text-white/90 hover:text-white p-2 backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title={language === "ms" ? "Skrin Penuh" : "Fullscreen"}
                aria-label={language === "ms" ? "Skrin Penuh" : "Fullscreen"}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Controls inside Video */}
            <div className="flex items-center justify-between pointer-events-auto gap-3">
              <div className="flex items-center gap-2">
                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 rounded-lg bg-white/90 text-slate-900 hover:bg-white px-3 py-1.5 text-[12px] font-semibold shadow-md backdrop-blur-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  title={isPlaying ? t("demo_pause") : t("demo_play")}
                  aria-label={isPlaying ? t("demo_pause") : t("demo_play")}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>{t("demo_pause")}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{t("demo_play")}</span>
                    </>
                  )}
                </button>

                {/* Restart Button */}
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rounded-lg bg-black/50 text-white/90 hover:text-white p-2 backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  title={language === "ms" ? "Ulang Dari Mula" : "Restart"}
                  aria-label={language === "ms" ? "Ulang Dari Mula" : "Restart"}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Sound / Unmute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold backdrop-blur-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isMuted
                    ? "bg-black/60 text-white/90 hover:bg-black/80 hover:text-white"
                    : "bg-accent text-white hover:bg-accent/90 shadow-md"
                }`}
                title={isMuted ? t("demo_sound_unmute") : t("demo_sound_mute")}
                aria-label={isMuted ? t("demo_sound_unmute") : t("demo_sound_mute")}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>{t("demo_sound_unmute")}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{t("demo_sound_mute")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Persistent Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-subtle/30 dark:bg-dark-subtle/30 text-[12px] text-ink-secondary dark:text-dark-ink-secondary border-t border-line/40 dark:border-dark-line/40">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-medium text-ink dark:text-dark-ink">
              {language === "ms"
                ? "Demonstrasi alatan diagnostik & penyelesaian triage"
                : "Live demonstration of symptom triage & guided diagnosis"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex items-center gap-1.5 text-accent dark:text-dark-accent font-semibold hover:underline"
            >
              {isMuted ? (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{t("demo_sound_unmute")}</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>{t("demo_sound_mute")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const JARGON_DEFINITIONS = {
  RAM: {
    en: "Random Access Memory: your PC short-term memory sticks. Reseating them fixes many black-screen boot problems.",
    ms: "Kepingan memori kerja jangka pendek. Cabut dan cucuk semula kerap selesaikan masalah PC tak keluar gambar.",
  },
  GPU: {
    en: "Graphics Card: the powerful video component at the bottom of your PC that your monitor cable must plug into.",
    ms: "Kad grafik: komponen paparan utama di slot bawah PC tempat kabel monitor patut dicucuk.",
  },
  PSU: {
    en: "Power Supply Unit: the metal box at the bottom/top of your PC where the wall power cord plugs in.",
    ms: "Bekalan kuasa: kotak besi dalam casing tempat wayar suis plug elektrik dinding dicucuk.",
  },
  BIOS: {
    en: "Basic Input/Output System: the initial motherboard firmware that starts up before Windows loads.",
    ms: "Firmware asas motherboard yang mula-mula hidup sebelum Windows masuk.",
  },
  CMOS: {
    en: "The coin-sized CR2032 battery on your motherboard that keeps time and BIOS settings saved.",
    ms: "Bateri bulat leper CR2032 atas motherboard yang kekalkan jam dan tetapan hardware.",
  },
  POST: {
    en: "Power-On Self-Test: the quick hardware self-check your PC runs in the first 3 seconds of booting.",
    ms: "Ujian ringkas perkakasan yang komputer jalankan dalam 3 saat pertama sebaik dihidupkan.",
  },
  SSD: {
    en: "Solid State Drive: high-speed digital storage drive holding Windows and all your personal files.",
    ms: "Storan laju digital tempat sistem Windows dan semua fail anda tersimpan.",
  },
  DisplayPort: {
    en: "High-bandwidth monitor cable with one flat edge and a lock latch. Always connect to your GPU.",
    ms: "Kabel monitor berprestasi tinggi dengan satu bucu senget. Wajib cucuk pada slot GPU bawah.",
  },
  HDMI: {
    en: "Standard trapezoid monitor cable. Always plug into the lower GPU horizontal slots, not the motherboard.",
    ms: "Kabel paparan biasa. Pastikan dicucuk pada slot mendatar GPU bawah, bukan port motherboard atas.",
  },
} as const;

export type JargonTerm = keyof typeof JARGON_DEFINITIONS;

export default function JargonTooltip({
  term,
  children,
}: {
  term: JargonTerm;
  children?: React.ReactNode;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  const def = JARGON_DEFINITIONS[term];
  if (!def) return <>{children || term}</>;

  const explanation = language === "ms" ? def.ms : def.en;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Definition for ${term}: ${explanation}`}
        className="inline font-semibold text-accent dark:text-dark-accent underline decoration-dotted decoration-accent/60 underline-offset-4 hover:decoration-solid cursor-help transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xs"
      >
        {children || term}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-xl border border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95 text-[12px] leading-relaxed font-normal text-ink dark:text-dark-ink shadow-card dark:shadow-card-dark backdrop-blur-md z-50 pointer-events-none text-left"
        >
          <span className="block font-bold text-accent dark:text-dark-accent mb-0.5">
            {term}
          </span>
          <span>{explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-dark-card" />
        </span>
      )}
    </span>
  );
}
